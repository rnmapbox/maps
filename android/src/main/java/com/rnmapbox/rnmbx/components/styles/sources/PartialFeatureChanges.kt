package com.rnmapbox.rnmbx.components.styles.sources

import com.facebook.react.bridge.Promise
import com.mapbox.geojson.Feature
import java.util.ArrayDeque

internal enum class PartialChangeType { ADD, UPDATE, REMOVE }

/** A call of addFeatures, updateFeatures or removeFeatures that the SDK has not ruled on yet. */
internal class PartialChange(
    val type: PartialChangeType,
    val featureIds: List<String>,
    val features: List<Feature>,
    val shapeRevision: Int,
    val sequence: Long,
    val promise: Promise
) {
    val dataId: String get() = sequence.toString()

    fun firstFeatures(count: Int) = PartialChange(
        type, featureIds.take(count), features.take(count), shapeRevision, sequence, promise
    )
}

/** What a refused SDK call did: `applied` took effect, `refused` did not, and the rest was never looked at. */
internal class PartialRefusal(
    val applied: List<PartialChange>,
    val appliedPart: PartialChange?,
    val refused: PartialChange
)

/**
 * The calls waiting for a result, oldest first. One SDK call is in flight at a time, as the SDK
 * reports unreliably on calls it merges itself. Calls of the same type that wait meanwhile are
 * merged here instead, which keeps up with frequent changes. A refused SDK call is not atomic: it
 * stops at the first bad feature id, which the error names, and keeps the features before it.
 */
internal class PendingPartialChanges {
    private val changes = ArrayDeque<PartialChange>()
    private var inFlight = listOf<PartialChange>()
    private var nextSequence = 1L

    val isEmpty: Boolean get() = changes.isEmpty()

    fun add(
        type: PartialChangeType,
        featureIds: List<String>,
        features: List<Feature>,
        shapeRevision: Int,
        promise: Promise
    ) {
        changes.add(PartialChange(type, featureIds, features, shapeRevision, nextSequence++, promise))
    }

    /** The calls to send now as one, if none is in flight and the oldest was made on this revision of the shape. */
    fun next(shapeRevision: Int): List<PartialChange> {
        val first = changes.peekFirst()
        if (inFlight.isNotEmpty() || first == null || first.shapeRevision != shapeRevision) return listOf()
        val merged = mutableListOf<PartialChange>()
        val ids = HashSet<String>()
        for (change in changes) {
            // A second add of an id must fail on its own, the later of two updates just wins. Removes
            // stay single: a merged one that was refused couldn't render the removals it kept.
            val mergeable = change.type == first.type && change.shapeRevision == shapeRevision &&
                (change.type == PartialChangeType.UPDATE || change.featureIds.none { it in ids }) &&
                (change.type != PartialChangeType.REMOVE || merged.isEmpty())
            if (!mergeable) break
            merged.add(change)
            ids.addAll(change.featureIds)
        }
        inFlight = merged
        return inFlight
    }

    fun markNoneInFlight() {
        inFlight = listOf()
    }

    fun isInFlight(dataId: String): Boolean = inFlight.lastOrNull()?.dataId == dataId

    /** The SDK leaves `dataId` empty when it refuses a call straight away. */
    fun isRefusalOfInFlight(dataId: String, featureId: String?): Boolean =
        inFlight.isNotEmpty() && (dataId.isEmpty() || isInFlight(dataId)) &&
            (featureId == null || inFlight.any { featureId in it.featureIds })

    fun confirm(): List<PartialChange> = takeInFlight()

    /** `featureId` is null when the SDK refused the call as a whole. */
    fun refuse(featureId: String?): PartialRefusal {
        val refusedIndex = inFlight.indexOfFirst { featureId in it.featureIds }.coerceAtLeast(0)
        val refused = inFlight[refusedIndex]
        val appliedCalls = inFlight.take(refusedIndex)
        val appliedCount = refused.featureIds.indexOf(featureId)
        changes.removeAll(inFlight.take(refusedIndex + 1).toSet())
        inFlight = listOf()
        return PartialRefusal(appliedCalls, if (appliedCount > 0) refused.firstFeatures(appliedCount) else null, refused)
    }

    fun replacedBy(shapeRevision: Int): List<PartialChange> {
        inFlight = inFlight.filter { it.shapeRevision >= shapeRevision }
        return takeWhile { it.shapeRevision < shapeRevision }
    }

    fun clear(): List<PartialChange> {
        inFlight = listOf()
        return takeWhile { true }
    }

    private fun takeInFlight(): List<PartialChange> {
        val taken = inFlight
        inFlight = listOf()
        changes.removeAll(taken.toSet())
        return taken
    }

    private fun takeWhile(predicate: (PartialChange) -> Boolean): List<PartialChange> {
        val taken = mutableListOf<PartialChange>()
        while (changes.peekFirst()?.let(predicate) == true) {
            taken.add(changes.pollFirst()!!)
        }
        return taken
    }
}

/**
 * Net effect of the confirmed calls since the last shape or url, kept to reapply them when the
 * style reloads. The SDK refuses adding an existing id and updating or removing a missing one, so
 * each id is tracked by how it relates to the shape.
 */
internal class PartialFeatureChanges {
    private val addedById = LinkedHashMap<String, Feature>()
    private val updatedById = LinkedHashMap<String, Feature>()
    private val removedIds = LinkedHashSet<String>()

    val added: List<Feature> get() = addedById.values.toList()
    val updated: List<Feature> get() = updatedById.values.toList()
    val removed: List<String> get() = removedIds.toList()

    fun record(change: PartialChange) {
        when (change.type) {
            PartialChangeType.ADD -> change.featureIds.zip(change.features).forEach { (id, feature) ->
                if (removedIds.remove(id)) updatedById[id] = feature else addedById[id] = feature
            }
            PartialChangeType.UPDATE -> change.featureIds.zip(change.features).forEach { (id, feature) ->
                if (addedById.containsKey(id)) addedById[id] = feature else updatedById[id] = feature
            }
            PartialChangeType.REMOVE -> change.featureIds.forEach { id ->
                if (addedById.remove(id) == null) {
                    updatedById.remove(id)
                    removedIds.add(id)
                }
            }
        }
    }

    fun clear() {
        addedById.clear()
        updatedById.clear()
        removedIds.clear()
    }
}
