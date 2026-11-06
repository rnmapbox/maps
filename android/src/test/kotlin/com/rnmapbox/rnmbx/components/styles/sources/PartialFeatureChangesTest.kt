package com.rnmapbox.rnmbx.components.styles.sources

import com.facebook.react.bridge.Promise
import com.mapbox.geojson.Feature
import com.mapbox.geojson.Point
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.Mockito

class PartialFeatureChangesTest {
    private val promise = Mockito.mock(Promise::class.java)

    private fun feature(id: String, version: Int = 1): Feature =
        Feature.fromGeometry(Point.fromLngLat(0.0, 0.0), null, id).also {
            it.addNumberProperty("version", version)
        }

    private fun ids(features: List<Feature>) = features.map { it.id() }

    private class Sequence(private val test: PartialFeatureChangesTest) {
        val pending = PendingPartialChanges()
        val tracked = PartialFeatureChanges()

        private fun send(
            accepted: Boolean,
            refusedId: String?,
            type: PartialChangeType,
            ids: List<String>,
            features: List<Feature>
        ) {
            pending.add(type, ids, features, 1, test.promise)
            pending.next(1)
            if (accepted) {
                pending.confirm().forEach(tracked::record)
            } else {
                val refusal = pending.refuse(refusedId ?: ids.first())
                refusal.applied.forEach(tracked::record)
                refusal.appliedPart?.let(tracked::record)
            }
        }

        fun add(vararg ids: String, version: Int = 1, accepted: Boolean = true, refusedId: String? = null) =
            send(accepted, refusedId, PartialChangeType.ADD, ids.toList(), ids.map { test.feature(it, version) })

        fun update(vararg ids: String, version: Int = 1, accepted: Boolean = true, refusedId: String? = null) =
            send(accepted, refusedId, PartialChangeType.UPDATE, ids.toList(), ids.map { test.feature(it, version) })

        fun remove(vararg ids: String, accepted: Boolean = true, refusedId: String? = null) =
            send(accepted, refusedId, PartialChangeType.REMOVE, ids.toList(), listOf())
    }

    private fun sequence(steps: Sequence.() -> Unit) = Sequence(this).apply(steps)

    private fun assertTracked(
        sequence: Sequence,
        added: List<String> = listOf(),
        updated: List<String> = listOf(),
        removed: List<String> = listOf()
    ) {
        assertEquals(added, ids(sequence.tracked.added))
        assertEquals(updated, ids(sequence.tracked.updated))
        assertEquals(removed, sequence.tracked.removed)
    }

    @Test
    fun `a refused remove followed by an add is an added feature`() {
        val steps = sequence {
            remove("x", accepted = false)
            add("x")
        }
        assertTracked(steps, added = listOf("x"))
    }

    @Test
    fun `a refused update followed by an add keeps the added feature`() {
        val steps = sequence {
            update("x", version = 1, accepted = false)
            add("x", version = 2)
        }
        assertTracked(steps, added = listOf("x"))
        assertEquals(2, steps.tracked.added[0].getNumberProperty("version").toInt())
    }

    @Test
    fun `a refused add of a shape feature followed by a remove stays removed`() {
        val steps = sequence {
            add("a", accepted = false)
            remove("a")
        }
        assertTracked(steps, removed = listOf("a"))
    }

    @Test
    fun `a refused call tracks the features before the refused id`() {
        val steps = sequence { update("a", "b", "missing", "c", accepted = false, refusedId = "missing") }
        assertTracked(steps, updated = listOf("a", "b"))
    }

    @Test
    fun `a call refused at its first id tracks nothing`() {
        val steps = sequence { update("missing", "a", accepted = false, refusedId = "missing") }
        assertTracked(steps)
    }

    @Test
    fun `a call refused as a whole tracks nothing`() {
        val pending = pending(update to "a")
        pending.next(1)

        val refusal = pending.refuse(null)

        assertEquals("1", refusal.refused.dataId)
        assertNull(refusal.appliedPart)
        assertTrue(refusal.applied.isEmpty())
    }

    @Test
    fun `an update of an added feature stays an add`() {
        val steps = sequence {
            add("x", version = 1)
            update("x", version = 2)
        }
        assertTracked(steps, added = listOf("x"))
        assertEquals(2, steps.tracked.added[0].getNumberProperty("version").toInt())
    }

    @Test
    fun `removing an added feature leaves nothing to replay`() {
        val steps = sequence {
            add("x")
            remove("x")
        }
        assertTracked(steps)
    }

    @Test
    fun `removing an updated feature replays only the removal`() {
        val steps = sequence {
            update("a")
            remove("a")
        }
        assertTracked(steps, removed = listOf("a"))
    }

    @Test
    fun `adding back a removed shape feature is an update`() {
        val steps = sequence {
            remove("a")
            add("a", version = 2)
        }
        assertTracked(steps, updated = listOf("a"))
    }

    @Test
    fun `features replay in the order they were first changed`() {
        val steps = sequence {
            add("c")
            add("a")
            update("c", version = 2)
            add("b")
        }
        assertTracked(steps, added = listOf("c", "a", "b"))
    }

    private fun pending(vararg calls: Pair<PartialChangeType, String>, shapeRevision: Int = 1) =
        PendingPartialChanges().apply {
            calls.forEach { (type, id) -> add(type, listOf(id), listOf(feature(id)), shapeRevision, promise) }
        }

    private val add = PartialChangeType.ADD
    private val update = PartialChangeType.UPDATE
    private val remove = PartialChangeType.REMOVE

    private fun dataIds(changes: List<PartialChange>) = changes.map { it.dataId }

    @Test
    fun `waiting calls of one type are merged`() {
        val pending = pending(update to "a", update to "b", update to "a")

        assertEquals(listOf("1", "2", "3"), dataIds(pending.next(1)))
    }

    @Test
    fun `a merge stops at another type`() {
        val pending = pending(update to "a", remove to "b", update to "c")

        assertEquals(listOf("1"), dataIds(pending.next(1)))
        pending.confirm()
        assertEquals(listOf("2"), dataIds(pending.next(1)))
        pending.confirm()
        assertEquals(listOf("3"), dataIds(pending.next(1)))
    }

    @Test
    fun `two adds of one id are not merged, as the second must be refused`() {
        val pending = pending(add to "a", add to "b", add to "a")

        assertEquals(listOf("1", "2"), dataIds(pending.next(1)))
        pending.confirm()
        assertEquals(listOf("3"), dataIds(pending.next(1)))
    }

    @Test
    fun `removes are not merged`() {
        val pending = pending(remove to "a", remove to "b")

        assertEquals(listOf("1"), dataIds(pending.next(1)))
    }

    @Test
    fun `a refused merged call settles the calls around the refused id`() {
        val pending = PendingPartialChanges()
        pending.add(update, listOf("a"), listOf(feature("a")), 1, promise)
        pending.add(update, listOf("b", "missing", "c"), listOf("b", "missing", "c").map { feature(it) }, 1, promise)
        pending.add(update, listOf("d"), listOf(feature("d")), 1, promise)
        pending.next(1)

        val refusal = pending.refuse("missing")

        assertEquals(listOf("1"), dataIds(refusal.applied))
        assertEquals(listOf("b"), refusal.appliedPart?.featureIds)
        assertEquals("2", refusal.refused.dataId)
        assertEquals(listOf("3"), dataIds(pending.next(1)))
    }

    @Test
    fun `nothing is sent while a call is in flight`() {
        val pending = pending(update to "a")
        pending.next(1)
        pending.add(update, listOf("b"), listOf(feature("b")), 1, promise)

        assertTrue(pending.next(1).isEmpty())
        pending.confirm()
        assertEquals(listOf("2"), dataIds(pending.next(1)))
    }

    @Test
    fun `a call made on a newer shape waits for it`() {
        val pending = pending(update to "a", shapeRevision = 2)

        assertTrue(pending.next(1).isEmpty())
        assertEquals(listOf("1"), dataIds(pending.next(2)))
    }

    @Test
    fun `a merge stops at a call made on a newer shape`() {
        val pending = pending(update to "a")
        pending.add(update, listOf("b"), listOf(feature("b")), 2, promise)

        assertEquals(listOf("1"), dataIds(pending.next(1)))
    }

    @Test
    fun `an empty data id refers to the call in flight`() {
        val pending = pending(update to "a")

        assertTrue(!pending.isRefusalOfInFlight("", "a"))
        pending.next(1)
        assertTrue(pending.isRefusalOfInFlight("", "a"))
    }

    @Test
    fun `an error about an id that is not in flight is not a refusal of it`() {
        val pending = pending(update to "a")
        pending.next(1)

        assertTrue(!pending.isRefusalOfInFlight("", "other"))
    }

    @Test
    fun `a merged call is known by its last data id`() {
        val pending = pending(update to "a", update to "b")
        pending.next(1)

        assertTrue(pending.isInFlight("2"))
        assertTrue(!pending.isInFlight("1"))
        assertTrue(!pending.isInFlight("9"))
    }

    @Test
    fun `a new shape replaces only the calls made on an older one`() {
        val pending = pending(update to "old")
        pending.add(update, listOf("new"), listOf(feature("new")), 2, promise)
        pending.next(1)

        assertEquals(listOf("1"), dataIds(pending.replacedBy(2)))
        assertEquals(listOf("2"), dataIds(pending.next(2)))
    }

    @Test
    fun `after a style reload the call in flight is sent again`() {
        val pending = pending(update to "a")
        pending.next(1)

        pending.markNoneInFlight()

        assertEquals(listOf("1"), dataIds(pending.next(1)))
    }
}
