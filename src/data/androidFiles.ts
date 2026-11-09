export interface AndroidFile {
  path: string;
  name: string;
  language: string;
  descriptionAr: string;
  code: string;
}

export const ANDROID_PROJECT_FILES: AndroidFile[] = [
  {
    path: 'build.gradle.kts',
    name: 'build.gradle.kts (Project)',
    language: 'kotlin',
    descriptionAr: 'ملف إعدادات البناء الرئيسي للمشروع وإصدارات المكونات الإضافية (Plugins).',
    code: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
}
`
  },
  {
    path: 'settings.gradle.kts',
    name: 'settings.gradle.kts',
    language: 'kotlin',
    descriptionAr: 'ملف إعداد المستودعات وموديولات المشروع.',
    code: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "SimuRelay"
include(":app")
`
  },
  {
    path: 'app/build.gradle.kts',
    name: 'app/build.gradle.kts (Module: app)',
    language: 'kotlin',
    descriptionAr: 'ملف تبعيات موديول التطبيق وتفعيل Jetpack Compose ومكتبات Material 3 ومحرك الرسوم.',
    code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.simurelay.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.simurelay.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    // Core Android & Lifecycle
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)

    // Jetpack Compose BOM & UI
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)

    // Coroutines for Simulation Clock & Timing
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")

    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
}
`
  },
  {
    path: 'gradle/libs.versions.toml',
    name: 'gradle/libs.versions.toml',
    language: 'toml',
    descriptionAr: 'كتالوج إصدارات المكتبات (Version Catalog) الموصى به رسمياً في أندرويد.',
    code: `[versions]
agp = "8.7.2"
kotlin = "2.0.21"
coreKtx = "1.15.0"
lifecycleRuntimeKtx = "2.8.7"
activityCompose = "1.9.3"
composeBom = "2024.10.01"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-lifecycle-viewmodel-compose = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-compose", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-compose-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-compose-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-compose-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
androidx-compose-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-compose-ui-test-manifest = { group = "androidx.compose.ui", name = "ui-test-manifest" }
androidx-compose-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-compose-material-icons-extended = { group = "androidx.compose.material", name = "material-icons-extended" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
`
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    language: 'xml',
    descriptionAr: 'ملف بيان التطبيق وتحديد النشاط الرئيسي وتوجيه الشاشة الأفقي المفضل للمخططات.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:icon="@android:drawable/sym_def_app_icon"
        android:label="SimuRelay"
        android:roundIcon="@android:drawable/sym_def_app_icon"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.Material.NoActionBar">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="unspecified"
            android:configChanges="orientation|screenSize"
            android:theme="@android:style/Theme.Material.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`
  },
  {
    path: 'app/src/main/java/com/simurelay/app/model/CircuitModel.kt',
    name: 'model/CircuitModel.kt',
    language: 'kotlin',
    descriptionAr: 'نماذج البيانات الكهربائية: المكونات، الأطراف، الأسلاك، وحالات التلامس والتشغيل.',
    code: `package com.simurelay.app.model

import androidx.compose.ui.geometry.Offset

/**
 * الأنواع المدعومة للعناصر الكهروميكانيكية والكهربائية
 */
enum class ComponentType {
    POWER_PHASE,        // مصدر جهد الطور (L1 / 230V)
    POWER_NEUTRAL,      // المحايد (Neutral)
    PUSHBUTTON_NO,      // زر تشغيل مفتوح عادةً (Start)
    PUSHBUTTON_NC,      // زر إيقاف مغلق عادةً (Stop)
    CONTACTOR_COIL,     // ملف كونتاكتور (KM1 A1-A2)
    CONTACTOR_CONTACT_NO, // نقطة تلامس مساعدة مفتوحة عادةً (13-14)
    CONTACTOR_CONTACT_NC, // نقطة تلامس مساعدة مغلقة عادةً (21-22)
    TIMER_COIL,         // ملف مؤقت زمني On-Delay (KT1)
    TIMER_CONTACT_NO,   // نقطة مؤقت مفتوحة بعد انتهاء الزمن (17-18)
    THERMAL_OVERLOAD,   // مرحل حراري للحماية (F1 95-96)
    MOTOR_3PHASE,       // محرك حثي ثلاثي الأطوار
    PILOT_LAMP          // مصباح إشارة وبيان (H1)
}

enum class Polarity {
    NONE,
    PHASE,
    NEUTRAL
}

enum class MotorDirection {
    STOPPED,
    CW,       // دوران باتجاه عقارب الساعة (Forward)
    CCW       // دوران عكس عقارب الساعة (Reverse)
}

/**
 * يمثل طرف التوصيل الكهربائي للعنصر (Terminal)
 */
data class Terminal(
    val id: String,
    val name: String,
    val relativePosition: Offset,
    val polarity: Polarity = Polarity.NONE
)

/**
 * يمثل العنصر الكهربائي كاملاً في مساحة الرسم
 */
data class CircuitComponent(
    val id: String,
    val name: String,
    val tag: String,              // مثل: KM1, S1, S0, KT1, M1
    val type: ComponentType,
    val position: Offset,
    val width: Float = 140f,
    val height: Float = 80f,
    val terminals: List<Terminal>,
    
    // الحالات الديناميكية أثناء المحاكاة
    val isPressed: Boolean = false,        // للأزرار الضاغطة
    val isEnergized: Boolean = false,      // للملفات والمصابيح
    val isClosed: Boolean = false,         // لنقاط التلامس
    val isTripped: Boolean = false,        // للمرحل الحراري
    
    // الارتباطات والخصائص
    val linkedTag: String? = null,         // ربط نقطة التلامس بملف الكونتاكتور المناسب
    val timerSeconds: Float = 3.0f,        // زمن المؤقت
    val timerElapsed: Float = 0.0f,        // الوقت المنقضي
    
    // حالة المحرك
    val motorRunning: Boolean = false,
    val motorDirection: MotorDirection = MotorDirection.STOPPED,
    val motorSpeedRpm: Int = 0
)

/**
 * يمثل السلك الكهربائي الرابط بين طرفي عنصرين
 */
data class Wire(
    val id: String,
    val fromComponentId: String,
    val fromTerminalId: String,
    val toComponentId: String,
    val toTerminalId: String,
    val isEnergized: Boolean = false
)

/**
 * حالة المحاكاة الشاملة
 */
data class SimulationState(
    val isRunning: Boolean = true,
    val isShortCircuit: Boolean = false,
    val logMessages: List<String> = emptyList()
)
`
  },
  {
    path: 'app/src/main/java/com/simurelay/app/engine/SimulationEngine.kt',
    name: 'engine/SimulationEngine.kt',
    language: 'kotlin',
    descriptionAr: 'محرك المحاكاة الرياضي والفيزيائي لحساب انتشار التيار وحالات التعشيق والتشابك والمؤقتات.',
    code: `package com.simurelay.app.engine

import com.simurelay.app.model.*

/**
 * محرك المحاكاة الكهربائية الكهروميكانيكية
 * يقوم بحل الدائرة باستخدام خوارزمية الانتشار التكراري (Iterative Propagation Fixed-Point Solver)
 * للتعامل الدقيق مع التعشيق الذاتي (Self-Holding Latch) والتشابك (Interlocking).
 */
object SimulationEngine {

    fun solve(
        components: List<CircuitComponent>,
        wires: List<Wire>,
        deltaSeconds: Float = 0.05f
    ): Pair<List<CircuitComponent>, List<Wire>> {
        val compMap = components.associateBy { it.id }.toMutableMap()
        val logs = mutableListOf<String>()

        // 1. تحديث المؤقتات النشطة
        val timedOutTags = mutableSetOf<String>()
        compMap.values.forEach { comp ->
            if (comp.type == ComponentType.TIMER_COIL) {
                if (comp.isEnergized) {
                    val newElapsed = comp.timerElapsed + deltaSeconds
                    compMap[comp.id] = comp.copy(timerElapsed = newElapsed)
                    if (newElapsed >= comp.timerSeconds) {
                        timedOutTags.add(comp.tag)
                    }
                } else {
                    compMap[comp.id] = comp.copy(timerElapsed = 0f)
                }
            }
        }

        // 2. تكرار حل الدائرة حتى استقرار الحالات (Convergence Loop)
        var changed = true
        var iterations = 0
        val maxIterations = 10

        while (changed && iterations < maxIterations) {
            changed = false
            iterations++

            // استخراج قائمة الملفات المغذاة حالياً
            val energizedCoilTags = compMap.values
                .filter { (it.type == ComponentType.CONTACTOR_COIL || it.type == ComponentType.TIMER_COIL) && it.isEnergized }
                .map { it.tag }
                .toSet()

            // تحديث حالة نقاط التلامس وفق المفاتيح والملفات والمؤقتات
            compMap.values.forEach { comp ->
                val newClosed = when (comp.type) {
                    ComponentType.PUSHBUTTON_NO -> comp.isPressed
                    ComponentType.PUSHBUTTON_NC -> !comp.isPressed
                    ComponentType.CONTACTOR_CONTACT_NO -> comp.linkedTag != null && energizedCoilTags.contains(comp.linkedTag)
                    ComponentType.CONTACTOR_CONTACT_NC -> comp.linkedTag == null || !energizedCoilTags.contains(comp.linkedTag)
                    ComponentType.TIMER_CONTACT_NO -> comp.linkedTag != null && timedOutTags.contains(comp.linkedTag)
                    ComponentType.THERMAL_OVERLOAD -> !comp.isTripped
                    else -> comp.isClosed
                }

                if (newClosed != comp.isClosed) {
                    compMap[comp.id] = comp.copy(isClosed = newClosed)
                    changed = true
                }
            }

            // بناء خارطة قطبية الأطراف (Terminal Polarity Map)
            val polarityMap = mutableMapOf<String, Polarity>()

            // حقن مصادر التغذية
            compMap.values.forEach { comp ->
                when (comp.type) {
                    ComponentType.POWER_PHASE -> comp.terminals.forEach {
                        polarityMap["\${comp.id}:\${it.id}"] = Polarity.PHASE
                    }
                    ComponentType.POWER_NEUTRAL -> comp.terminals.forEach {
                        polarityMap["\${comp.id}:\${it.id}"] = Polarity.NEUTRAL
                    }
                    else -> {}
                }
            }

            // انتشار الجهد عبر الأسلاك والنقاط المغلقة
            var propChanged = true
            var propCount = 0
            while (propChanged && propCount < 15) {
                propChanged = false
                propCount++

                // عبر الأسلاك
                wires.forEach { wire ->
                    val kFrom = "\${wire.fromComponentId}:\${wire.fromTerminalId}"
                    val kTo = "\${wire.toComponentId}:\${wire.toTerminalId}"
                    val pFrom = polarityMap[kFrom] ?: Polarity.NONE
                    val pTo = polarityMap[kTo] ?: Polarity.NONE

                    if (pFrom != Polarity.NONE && pTo == Polarity.NONE) {
                        polarityMap[kTo] = pFrom
                        propChanged = true
                    } else if (pTo != Polarity.NONE && pFrom == Polarity.NONE) {
                        polarityMap[kFrom] = pTo
                        propChanged = true
                    }
                }

                // عبر المسارات الداخلية للعناصر الموصلة
                compMap.values.forEach { comp ->
                    if (comp.isClosed && comp.terminals.size >= 2) {
                        val k1 = "\${comp.id}:\${comp.terminals[0].id}"
                        val k2 = "\${comp.id}:\${comp.terminals[1].id}"
                        val p1 = polarityMap[k1] ?: Polarity.NONE
                        val p2 = polarityMap[k2] ?: Polarity.NONE

                        if (p1 != Polarity.NONE && p2 == Polarity.NONE) {
                            polarityMap[k2] = p1
                            propChanged = true
                        } else if (p2 != Polarity.NONE && p1 == Polarity.NONE) {
                            polarityMap[k1] = p2
                            propChanged = true
                        }
                    }
                }
            }

            // فحص تغذية الملفات والأحمال (A1 متصل بالطور و A2 بالمحايد)
            compMap.values.forEach { comp ->
                if (comp.type == ComponentType.CONTACTOR_COIL || 
                    comp.type == ComponentType.TIMER_COIL || 
                    comp.type == ComponentType.PILOT_LAMP) {
                    
                    if (comp.terminals.size >= 2) {
                        val p1 = polarityMap["\${comp.id}:\${comp.terminals[0].id}"] ?: Polarity.NONE
                        val p2 = polarityMap["\${comp.id}:\${comp.terminals[1].id}"] ?: Polarity.NONE

                        val energized = (p1 == Polarity.PHASE && p2 == Polarity.NEUTRAL) ||
                                        (p1 == Polarity.NEUTRAL && p2 == Polarity.PHASE)

                        if (energized != comp.isEnergized) {
                            compMap[comp.id] = comp.copy(isEnergized = energized)
                            changed = true
                        }
                    }
                }
            }
        }

        // 3. تحديث حالة المحركات
        val km1Coil = compMap.values.find { it.tag == "KM1" && it.type == ComponentType.CONTACTOR_COIL }
        val km2Coil = compMap.values.find { it.tag == "KM2" && it.type == ComponentType.CONTACTOR_COIL }
        val overload = compMap.values.find { it.type == ComponentType.THERMAL_OVERLOAD }

        compMap.values.filter { it.type == ComponentType.MOTOR_3PHASE }.forEach { motor ->
            val isOverload = overload?.isTripped == true
            val updatedMotor = if (isOverload) {
                motor.copy(motorRunning = false, motorDirection = MotorDirection.STOPPED, motorSpeedRpm = 0)
            } else if (km1Coil?.isEnergized == true) {
                motor.copy(motorRunning = true, motorDirection = MotorDirection.CW, motorSpeedRpm = 1450)
            } else if (km2Coil?.isEnergized == true) {
                motor.copy(motorRunning = true, motorDirection = MotorDirection.CCW, motorSpeedRpm = 1450)
            } else {
                motor.copy(motorRunning = false, motorDirection = MotorDirection.STOPPED, motorSpeedRpm = 0)
            }
            compMap[motor.id] = updatedMotor
        }

        // 4. تحديث حالة إضاءة الأسلاك
        val updatedWires = wires.map { wire ->
            val fromComp = compMap[wire.fromComponentId]
            val isEnergized = fromComp?.isEnergized == true || fromComp?.isClosed == true
            wire.copy(isEnergized = isEnergized)
        }

        return Pair(compMap.values.toList(), updatedWires)
    }
}
`
  },
  {
    path: 'app/src/main/java/com/simurelay/app/viewmodel/CircuitViewModel.kt',
    name: 'viewmodel/CircuitViewModel.kt',
    language: 'kotlin',
    descriptionAr: 'مدير حالة التطبيق (State Holder) ومعالجة أحداث اللمس وتشغيل حلقة المحاكاة الدورية.',
    code: `package com.simurelay.app.viewmodel

import androidx.compose.ui.geometry.Offset
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.simurelay.app.engine.SimulationEngine
import com.simurelay.app.model.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

class CircuitViewModel : ViewModel() {

    private val _components = MutableStateFlow<List<CircuitComponent>>(emptyList())
    val components: StateFlow<List<CircuitComponent>> = _components.asStateFlow()

    private val _wires = MutableStateFlow<List<Wire>>(emptyList())
    val wires: StateFlow<List<Wire>> = _wires.asStateFlow()

    private val _simulationRunning = MutableStateFlow(true)
    val simulationRunning: StateFlow<Boolean> = _simulationRunning.asStateFlow()

    private val _selectedComponentId = MutableStateFlow<String?>(null)
    val selectedComponentId: StateFlow<String?> = _selectedComponentId.asStateFlow()

    init {
        loadDirectOnLinePreset()
        startSimulationLoop()
    }

    /**
     * حلقة المحاكاة الدورية (Simulation Tick) بمعدل 20 مرة في الثانية
     */
    private fun startSimulationLoop() {
        viewModelScope.launch {
            while (isActive) {
                if (_simulationRunning.value) {
                    val (solvedComps, solvedWires) = SimulationEngine.solve(
                        components = _components.value,
                        wires = _wires.value,
                        deltaSeconds = 0.05f
                    )
                    _components.value = solvedComps
                    _wires.value = solvedWires
                }
                delay(50) // 20 FPS
            }
        }
    }

    /**
     * الضغط على زر في الدائرة (Pushbutton Press)
     */
    fun onButtonPressed(componentId: String, pressed: Boolean) {
        _components.value = _components.value.map { comp ->
            if (comp.id == componentId) {
                comp.copy(isPressed = pressed)
            } else {
                comp
            }
        }
    }

    /**
     * تفعيل أو إعادة ضبط المرحل الحراري (Overload Trip Toggle)
     */
    fun toggleOverloadTrip(componentId: String) {
        _components.value = _components.value.map { comp ->
            if (comp.id == componentId) {
                comp.copy(isTripped = !comp.isTripped)
            } else {
                comp
            }
        }
    }

    /**
     * تحريك عنصر في مساحة الرسم
     */
    fun moveComponent(componentId: String, dragAmount: Offset) {
        _components.value = _components.value.map { comp ->
            if (comp.id == componentId) {
                comp.copy(position = comp.position + dragAmount)
            } else {
                comp
            }
        }
    }

    /**
     * تبديل حالة تشغيل المحاكاة
     */
    fun toggleSimulation() {
        _simulationRunning.value = !_simulationRunning.value
    }

    /**
     * إنشاء مشروع جديد (Blank أو قالب محدد)
     */
    fun createNewProject(projectName: String, templateType: String) {
        when (templateType) {
            "blank" -> {
                val l1 = CircuitComponent(
                    id = "p_phase",
                    name = "L1 Phase (230V)",
                    tag = "L1",
                    type = ComponentType.POWER_PHASE,
                    position = Offset(80f, 60f),
                    terminals = listOf(Terminal("L1", "L1", Offset(70f, 40f), Polarity.PHASE))
                )
                val neutral = CircuitComponent(
                    id = "p_neutral",
                    name = "Neutral (N)",
                    tag = "N",
                    type = ComponentType.POWER_NEUTRAL,
                    position = Offset(80f, 600f),
                    terminals = listOf(Terminal("N", "N", Offset(70f, 40f), Polarity.NEUTRAL))
                )
                _components.value = listOf(l1, neutral)
                _wires.value = emptyList()
            }
            "reverse" -> loadReverseMotorPreset()
            else -> loadDirectOnLinePreset()
        }
    }

    /**
     * إضافة عنصر كهربائي جديد إلى مساحة الرسم
     */
    fun addComponent(type: ComponentType) {
        val nextIndex = _components.value.size + 1
        val newComp = when (type) {
            ComponentType.PUSHBUTTON_NO -> CircuitComponent(
                id = "btn_no_\$nextIndex",
                name = "Start Button",
                tag = "S\$nextIndex",
                type = ComponentType.PUSHBUTTON_NO,
                position = Offset(250f, 250f),
                terminals = listOf(Terminal("3", "3", Offset(70f, 0f)), Terminal("4", "4", Offset(70f, 80f)))
            )
            ComponentType.CONTACTOR_COIL -> CircuitComponent(
                id = "km_coil_\$nextIndex",
                name = "Contactor Coil",
                tag = "KM\$nextIndex",
                type = ComponentType.CONTACTOR_COIL,
                position = Offset(250f, 400f),
                terminals = listOf(Terminal("A1", "A1", Offset(70f, 0f)), Terminal("A2", "A2", Offset(70f, 80f)))
            )
            ComponentType.TIMER_COIL -> CircuitComponent(
                id = "timer_\$nextIndex",
                name = "On-Delay Timer",
                tag = "KT\$nextIndex",
                type = ComponentType.TIMER_COIL,
                position = Offset(250f, 400f),
                timerSeconds = 3f,
                terminals = listOf(Terminal("A1", "A1", Offset(70f, 0f)), Terminal("A2", "A2", Offset(70f, 80f)))
            )
            ComponentType.PILOT_LAMP -> CircuitComponent(
                id = "lamp_\$nextIndex",
                name = "Pilot Lamp",
                tag = "H\$nextIndex",
                type = ComponentType.PILOT_LAMP,
                position = Offset(350f, 300f),
                terminals = listOf(Terminal("X1", "X1", Offset(70f, 0f)), Terminal("X2", "X2", Offset(70f, 80f)))
            )
            else -> CircuitComponent(
                id = "comp_\$nextIndex",
                name = "Component",
                tag = "C\$nextIndex",
                type = type,
                position = Offset(200f, 200f),
                terminals = listOf(Terminal("1", "1", Offset(70f, 0f)), Terminal("2", "2", Offset(70f, 80f)))
            )
        }
        _components.value = _components.value + newComp
    }

    /**
     * ربط سلك بين طرفين
     */
    fun addWire(fromCompId: String, fromTermId: String, toCompId: String, toTermId: String) {
        val newWire = Wire(
            id = "w_\${System.currentTimeMillis()}",
            fromComponentId = fromCompId,
            fromTerminalId = fromTermId,
            toComponentId = toCompId,
            toTerminalId = toTermId
        )
        _wires.value = _wires.value + newWire
    }

    /**
     * حذف عنصر وجميع الأسلاك المتصلة به
     */
    fun removeComponent(componentId: String) {
        _components.value = _components.value.filter { it.id != componentId }
        _wires.value = _wires.value.filter { it.fromComponentId != componentId && it.toComponentId != componentId }
    }

    private fun loadReverseMotorPreset() {
        // Reverse direction starter setup
        loadDirectOnLinePreset()
    }

    /**
     * تحميل دائرة التشغيل المباشر الافتراضية DOL مع التعشيق الذاتي
     */
    fun loadDirectOnLinePreset() {
        val l1 = CircuitComponent(
            id = "p_phase",
            name = "L1 Phase (230V)",
            tag = "L1",
            type = ComponentType.POWER_PHASE,
            position = Offset(80f, 60f),
            terminals = listOf(Terminal("L1", "L1", Offset(70f, 40f), Polarity.PHASE))
        )

        val f1 = CircuitComponent(
            id = "f1_overload",
            name = "Thermal Overload (95-96)",
            tag = "F1",
            type = ComponentType.THERMAL_OVERLOAD,
            position = Offset(80f, 180f),
            isClosed = true,
            terminals = listOf(
                Terminal("95", "95", Offset(70f, 0f)),
                Terminal("96", "96", Offset(70f, 80f))
            )
        )

        val s0 = CircuitComponent(
            id = "s0_stop",
            name = "Stop Button (NC)",
            tag = "S0",
            type = ComponentType.PUSHBUTTON_NC,
            position = Offset(80f, 320f),
            isClosed = true,
            terminals = listOf(
                Terminal("1", "1", Offset(70f, 0f)),
                Terminal("2", "2", Offset(70f, 80f))
            )
        )

        val s1 = CircuitComponent(
            id = "s1_start",
            name = "Start Button (NO)",
            tag = "S1",
            type = ComponentType.PUSHBUTTON_NO,
            position = Offset(80f, 470f),
            isClosed = false,
            terminals = listOf(
                Terminal("3", "3", Offset(70f, 0f)),
                Terminal("4", "4", Offset(70f, 80f))
            )
        )

        val km1Aux = CircuitComponent(
            id = "km1_aux_no",
            name = "Latch (KM1 NO 13-14)",
            tag = "KM1-NO",
            linkedTag = "KM1",
            type = ComponentType.CONTACTOR_CONTACT_NO,
            position = Offset(290f, 470f),
            isClosed = false,
            terminals = listOf(
                Terminal("13", "13", Offset(70f, 0f)),
                Terminal("14", "14", Offset(70f, 80f))
            )
        )

        val km1Coil = CircuitComponent(
            id = "km1_coil",
            name = "Contactor Coil (KM1)",
            tag = "KM1",
            type = ComponentType.CONTACTOR_COIL,
            position = Offset(80f, 620f),
            terminals = listOf(
                Terminal("A1", "A1", Offset(70f, 0f)),
                Terminal("A2", "A2", Offset(70f, 80f))
            )
        )

        val neutral = CircuitComponent(
            id = "p_neutral",
            name = "Neutral (N)",
            tag = "N",
            type = ComponentType.POWER_NEUTRAL,
            position = Offset(80f, 760f),
            terminals = listOf(Terminal("N", "N", Offset(70f, 40f), Polarity.NEUTRAL))
        )

        val lamp = CircuitComponent(
            id = "lamp_run",
            name = "Run Indicator (H1)",
            tag = "H1",
            type = ComponentType.PILOT_LAMP,
            position = Offset(290f, 620f),
            terminals = listOf(
                Terminal("X1", "X1", Offset(70f, 0f)),
                Terminal("X2", "X2", Offset(70f, 80f))
            )
        )

        val motor = CircuitComponent(
            id = "motor_m1",
            name = "3-Phase Motor (M1)",
            tag = "M1",
            type = ComponentType.MOTOR_3PHASE,
            position = Offset(520f, 320f),
            width = 200f,
            height = 200f,
            terminals = listOf(
                Terminal("U", "U", Offset(50f, 20f)),
                Terminal("V", "V", Offset(100f, 20f)),
                Terminal("W", "W", Offset(150f, 20f))
            )
        )

        val defaultWires = listOf(
            Wire("w1", "p_phase", "L1", "f1_overload", "95"),
            Wire("w2", "f1_overload", "96", "s0_stop", "1"),
            Wire("w3", "s0_stop", "2", "s1_start", "3"),
            Wire("w4", "s0_stop", "2", "km1_aux_no", "13"),
            Wire("w5", "s1_start", "4", "km1_coil", "A1"),
            Wire("w6", "km1_aux_no", "14", "km1_coil", "A1"),
            Wire("w7", "km1_coil", "A1", "lamp_run", "X1"),
            Wire("w8", "km1_coil", "A2", "lamp_run", "X2"),
            Wire("w9", "km1_coil", "A2", "p_neutral", "N")
        )

        _components.value = listOf(l1, f1, s0, s1, km1Aux, km1Coil, neutral, lamp, motor)
        _wires.value = defaultWires
    }
}
`
  },
  {
    path: 'app/src/main/java/com/simurelay/app/ui/theme/Theme.kt',
    name: 'ui/theme/Theme.kt',
    language: 'kotlin',
    descriptionAr: 'سمة التطبيق وألوان التصميم الصناعي المتناسقة مع معايير Material 3 الحديثة.',
    code: `package com.simurelay.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val IndustrialDark = Color(0xFF0F172A)
val SurfaceDark = Color(0xFF1E293B)
val ElectricalAmber = Color(0xFFF59E0B)
val ElectricalNeon = Color(0xFF10B981)
val WirePhase = Color(0xFFEF4444)
val WireNeutral = Color(0xFF38BDF8)
val AccentCyan = Color(0xFF06B6D4)

private val DarkColorScheme = darkColorScheme(
    primary = ElectricalAmber,
    secondary = AccentCyan,
    tertiary = ElectricalNeon,
    background = IndustrialDark,
    surface = SurfaceDark,
    onPrimary = Color.Black,
    onBackground = Color(0xFFE2E8F0),
    onSurface = Color(0xFFF8FAFC)
)

@Composable
fun SimuRelayTheme(
    darkTheme: Boolean = true,
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography(),
        content = content
    )
}
`
  },
  {
    path: 'app/src/main/java/com/simurelay/app/ui/components/CircuitCanvas.kt',
    name: 'ui/components/CircuitCanvas.kt',
    language: 'kotlin',
    descriptionAr: 'مكون مساحة الرسم التفاعلي (Interactive Compose Canvas) لرسم الأسلاك، وتوهج التيار، والمحرك الدوار.',
    code: `package com.simurelay.app.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.unit.sp
import com.simurelay.app.model.*

@Composable
fun CircuitCanvas(
    components: List<CircuitComponent>,
    wires: List<Wire>,
    onComponentMove: (String, Offset) -> Unit,
    onButtonPressed: (String, Boolean) -> Unit,
    onOverloadToggle: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val textMeasurer = rememberTextMeasurer()

    Canvas(
        modifier = modifier
            .fillMaxSize()
            .pointerInput(Unit) {
                detectTapGestures(
                    onPress = { offset ->
                        val hitButton = components.find { comp ->
                            (comp.type == ComponentType.PUSHBUTTON_NO || comp.type == ComponentType.PUSHBUTTON_NC) &&
                            offset.x in comp.position.x..(comp.position.x + comp.width) &&
                            offset.y in comp.position.y..(comp.position.y + comp.height)
                        }

                        if (hitButton != null) {
                            onButtonPressed(hitButton.id, true)
                            tryAwaitRelease()
                            onButtonPressed(hitButton.id, false)
                        } else {
                            val hitOverload = components.find { comp ->
                                comp.type == ComponentType.THERMAL_OVERLOAD &&
                                offset.x in comp.position.x..(comp.position.x + comp.width) &&
                                offset.y in comp.position.y..(comp.position.y + comp.height)
                            }
                            if (hitOverload != null) {
                                onOverloadToggle(hitOverload.id)
                            }
                        }
                    }
                )
            }
            .pointerInput(Unit) {
                detectDragGestures { change, dragAmount ->
                    val pos = change.position
                    val hitComp = components.find { comp ->
                        pos.x in comp.position.x..(comp.position.x + comp.width) &&
                        pos.y in comp.position.y..(comp.position.y + comp.height)
                    }
                    if (hitComp != null) {
                        onComponentMove(hitComp.id, dragAmount)
                        change.consume()
                    }
                }
            }
    ) {
        val gridSize = 40f
        for (x in 0..size.width.toInt() step gridSize.toInt()) {
            drawLine(
                color = Color.White.copy(alpha = 0.05f),
                start = Offset(x.toFloat(), 0f),
                end = Offset(x.toFloat(), size.height),
                strokeWidth = 1f
            )
        }
        for (y in 0..size.height.toInt() step gridSize.toInt()) {
            drawLine(
                color = Color.White.copy(alpha = 0.05f),
                start = Offset(0f, y.toFloat()),
                end = Offset(size.width, y.toFloat()),
                strokeWidth = 1f
            )
        }

        val compMap = components.associateBy { it.id }
        wires.forEach { wire ->
            val fromComp = compMap[wire.fromComponentId]
            val toComp = compMap[wire.toComponentId]

            if (fromComp != null && toComp != null) {
                val fromTerm = fromComp.terminals.find { it.id == wire.fromTerminalId }
                val toTerm = toComp.terminals.find { it.id == wire.toTerminalId }

                if (fromTerm != null && toTerm != null) {
                    val p1 = fromComp.position + fromTerm.relativePosition
                    val p2 = toComp.position + toTerm.relativePosition

                    val wireColor = if (wire.isEnergized) Color(0xFFF59E0B) else Color(0xFF64748B)
                    val glowWidth = if (wire.isEnergized) 8f else 3f

                    if (wire.isEnergized) {
                        drawLine(
                            color = Color(0xFFF59E0B).copy(alpha = 0.35f),
                            start = p1,
                            end = p2,
                            strokeWidth = glowWidth + 6f
                        )
                    }

                    drawLine(
                        color = wireColor,
                        start = p1,
                        end = p2,
                        strokeWidth = glowWidth
                    )
                }
            }
        }

        components.forEach { comp ->
            val cardColor = when {
                comp.isEnergized -> Color(0xFF1E3A8A)
                comp.isTripped -> Color(0xFF7F1D1D)
                comp.isPressed -> Color(0xFF047857)
                else -> Color(0xFF1E293B)
            }

            drawRoundRect(
                color = cardColor,
                topLeft = comp.position,
                size = Size(comp.width, comp.height),
                cornerRadius = CornerRadius(12f, 12f)
            )

            drawRoundRect(
                color = if (comp.isEnergized) Color(0xFF38BDF8) else Color(0xFF475569),
                topLeft = comp.position,
                size = Size(comp.width, comp.height),
                cornerRadius = CornerRadius(12f, 12f),
                style = Stroke(width = 2f)
            )

            drawText(
                textMeasurer = textMeasurer,
                text = "\${comp.tag}: \${comp.name}",
                topLeft = comp.position + Offset(12f, 12f),
                style = TextStyle(color = Color.White, fontSize = 12.sp)
            )

            comp.terminals.forEach { term ->
                val termPos = comp.position + term.relativePosition
                drawCircle(
                    color = Color(0xFF0F172A),
                    radius = 8f,
                    center = termPos
                )
                drawCircle(
                    color = Color(0xFFF59E0B),
                    radius = 6f,
                    center = termPos,
                    style = Stroke(width = 2f)
                )
            }

            if (comp.type == ComponentType.MOTOR_3PHASE) {
                val center = comp.position + Offset(comp.width / 2, comp.height / 2 + 15f)
                drawCircle(
                    color = if (comp.motorRunning) Color(0xFF065F46) else Color(0xFF334155),
                    radius = 45f,
                    center = center
                )
                drawText(
                    textMeasurer = textMeasurer,
                    text = if (comp.motorRunning) "دوران: \${comp.motorDirection} (\${comp.motorSpeedRpm} RPM)" else "المحرك متوقف",
                    topLeft = comp.position + Offset(15f, comp.height - 25f),
                    style = TextStyle(color = if (comp.motorRunning) Color(0xFF34D399) else Color(0xFF94A3B8), fontSize = 11.sp)
                )
            }
        }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/simurelay/app/ui/screens/HomeScreen.kt',
    name: 'ui/screens/HomeScreen.kt',
    language: 'kotlin',
    descriptionAr: 'الشاشة الرئيسية للتطبيق مع دعم إضافة مشروع جديد ولوحة إضافة المكونات.',
    code: `package com.simurelay.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.simurelay.app.model.ComponentType
import com.simurelay.app.ui.components.CircuitCanvas
import com.simurelay.app.viewmodel.CircuitViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: CircuitViewModel = viewModel()
) {
    val components by viewModel.components.collectAsState()
    val wires by viewModel.wires.collectAsState()
    val isRunning by viewModel.simulationRunning.collectAsState()

    var showNewProjectDialog by remember { mutableStateOf(false) }
    var showAddComponentSheet by remember { mutableStateOf(false) }
    var newProjectName by remember { mutableStateOf("") }
    var selectedTemplate by remember { mutableStateOf("blank") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.ElectricBolt,
                            contentDescription = "SimuRelay Logo",
                            tint = Color(0xFFF59E0B)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "SimuRelay - محاكي التحكم الصناعي",
                            style = MaterialTheme.typography.titleMedium
                        )
                    }
                },
                actions = {
                    // زر إضافة مشروع جديد
                    IconButton(onClick = { showNewProjectDialog = true }) {
                        Icon(
                            imageVector = Icons.Default.CreateNewFolder,
                            contentDescription = "مشروع جديد",
                            tint = Color(0xFFF59E0B)
                        )
                    }
                    // زر تبديل المحاكاة
                    IconButton(onClick = { viewModel.toggleSimulation() }) {
                        Icon(
                            imageVector = if (isRunning) Icons.Default.Pause else Icons.Default.PlayArrow,
                            contentDescription = "تبديل المحاكاة",
                            tint = if (isRunning) Color(0xFF10B981) else Color(0xFFEF4444)
                        )
                    }
                    // زر إعادة ضبط
                    IconButton(onClick = { viewModel.loadDirectOnLinePreset() }) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "إعادة ضبط",
                            tint = Color.White
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddComponentSheet = true },
                containerColor = MaterialTheme.colorScheme.primary
            ) {
                Icon(Icons.Default.Add, contentDescription = "إضافة عنصر")
            }
        },
        bottomBar = {
            Surface(
                color = MaterialTheme.colorScheme.surface,
                tonalElevation = 4.dp
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 10.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    val motor = components.find { it.type == ComponentType.MOTOR_3PHASE }
                    val isMotorRunning = motor?.motorRunning == true

                    Text(
                        text = if (isMotorRunning) "الحالة: المحرك يعمل بنجاح ⚡" else "الحالة: جاهز للاختبار",
                        color = if (isMotorRunning) Color(0xFF34D399) else Color(0xFF94A3B8),
                        style = MaterialTheme.typography.bodyMedium
                    )

                    Button(
                        onClick = { showNewProjectDialog = true },
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                    ) {
                        Text("مشروع جديد (+)")
                    }
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(MaterialTheme.colorScheme.background)
        ) {
            CircuitCanvas(
                components = components,
                wires = wires,
                onComponentMove = { id, delta -> viewModel.moveComponent(id, delta) },
                onButtonPressed = { id, pressed -> viewModel.onButtonPressed(id, pressed) },
                onOverloadToggle = { id -> viewModel.toggleOverloadTrip(id) }
            )
        }
    }

    // حوار إضافة مشروع جديد في أندرويد
    if (showNewProjectDialog) {
        AlertDialog(
            onDismissRequest = { showNewProjectDialog = false },
            title = { Text("إضافة مشروع جديد") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("أدخل اسم المشروع ونوع القالب:")
                    OutlinedTextField(
                        value = newProjectName,
                        onValueChange = { newProjectName = it },
                        label = { Text("اسم المشروع") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        FilterChip(
                            selected = selectedTemplate == "blank",
                            onClick = { selectedTemplate = "blank" },
                            label = { Text("لوحة فارغة") }
                        )
                        FilterChip(
                            selected = selectedTemplate == "dol",
                            onClick = { selectedTemplate = "dol" },
                            label = { Text("دائرة DOL") }
                        )
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val name = if (newProjectName.isNotBlank()) newProjectName else "مشروع جديد"
                        viewModel.createNewProject(name, selectedTemplate)
                        showNewProjectDialog = false
                    }
                ) {
                    Text("إنشاء")
                }
            },
            dismissButton = {
                TextButton(onClick = { showNewProjectDialog = false }) {
                    Text("إلغاء")
                }
            }
        )
    }

    // نافذة اختيار وإضافة عنصر كهربائي
    if (showAddComponentSheet) {
        ModalBottomSheet(onDismissRequest = { showAddComponentSheet = false }) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(
                    text = "اختر عنصراً لإضافته إلى المخطط",
                    style = MaterialTheme.typography.titleMedium
                )
                Button(
                    modifier = Modifier.fillMaxWidth(),
                    onClick = {
                        viewModel.addComponent(ComponentType.PUSHBUTTON_NO)
                        showAddComponentSheet = false
                    }
                ) {
                    Text("زر تشغيل Start (NO)")
                }
                Button(
                    modifier = Modifier.fillMaxWidth(),
                    onClick = {
                        viewModel.addComponent(ComponentType.CONTACTOR_COIL)
                        showAddComponentSheet = false
                    }
                ) {
                    Text("ملف كونتاكتور KM")
                }
                Button(
                    modifier = Modifier.fillMaxWidth(),
                    onClick = {
                        viewModel.addComponent(ComponentType.TIMER_COIL)
                        showAddComponentSheet = false
                    }
                ) {
                    Text("مؤقت زمني On-Delay KT")
                }
                Button(
                    modifier = Modifier.fillMaxWidth(),
                    onClick = {
                        viewModel.addComponent(ComponentType.PILOT_LAMP)
                        showAddComponentSheet = false
                    }
                ) {
                    Text("مصباح بيان H1")
                }
            }
        }
    }
}
`
  }
,
  {
    path: 'app/src/main/java/com/simurelay/app/MainActivity.kt',
    name: 'MainActivity.kt',
    language: 'kotlin',
    descriptionAr: 'نقطة دخول التطبيق والنشاط الرئيسي (MainActivity) باستدعاء HomeScreen مع Compose.',
    code: `package com.simurelay.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.simurelay.app.ui.screens.HomeScreen
import com.simurelay.app.ui.theme.SimuRelayTheme

/**
 * النشاط الرئيسي لتطبيق SimuRelay
 * محاكي الدوائر الكهروميكانيكية والتحكم الصناعي
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            SimuRelayTheme {
                HomeScreen()
            }
        }
    }
}
`
  }
];
