import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.ReadableMap
import com.rnmapbox.rnmbx.components.styles.RNMBXStyleValue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import org.mockito.Mockito
import java.util.Locale

class RNMBXStyleValueTest {

    private lateinit var mockConfig: ReadableMap
    private lateinit var mockPayload: ReadableMap
    private lateinit var mockDynamic: Dynamic

    @BeforeEach
    fun setup() {
        mockConfig = Mockito.mock(ReadableMap::class.java)
        mockPayload = Mockito.mock(ReadableMap::class.java)
        mockDynamic = Mockito.mock(Dynamic::class.java)

        Mockito.`when`(mockConfig.getMap("stylevalue")).thenReturn(mockPayload)
        Mockito.`when`(mockPayload.getDynamic("value")).thenReturn(mockDynamic)
    }

    @Test
    fun `getEnumName returns correct enum name`() {
        Mockito.`when`(mockPayload.getString("value")).thenReturn("test-value")

        val styleValue = RNMBXStyleValue(mockConfig)

        assertEquals("TEST_VALUE", styleValue.getEnumName())
    }

    @Test
    fun `getEnumName handles Turkish locale correctly`() {
        Mockito.`when`(mockPayload.getString("value")).thenReturn("miter")

        val styleValue = RNMBXStyleValue(mockConfig)

        Locale.setDefault(Locale("tr", "TR"))

        assertEquals("MITER", styleValue.getEnumName())

        Locale.setDefault(Locale.getDefault())
    }
}
