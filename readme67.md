# Manual de Usuario - Pantalla: Gestión de Usuarios

---

## Pantalla: Gestión de Usuarios

**Propósito:** Administrar las cuentas de usuarios registrados en la aplicación. Solo los usuarios con rol de **Administrador** pueden acceder a esta pantalla. Permite crear, editar, activar/desactivar y eliminar usuarios.

---

### Elementos Visuales

- Título **"Gestión de Usuarios"** en la barra superior con botón de retroceso al menú principal
- Encabezado **"Usuarios"** con contador de usuarios registrados (ej: `3 usuario(s) registrado(s)`)
- **Lista de tarjetas de usuario**, cada una con:
  - Icono de persona circular con color según el rol (amarillo = Administrador, azul = Usuario)
  - Nombre completo del usuario
  - Correo electrónico
  - Badge con el rol asignado (Administrador / Usuario)
  - Fecha de creación
  - Estado: **Activo** (icono de check verde) o **Inactivo** (icono de X rojo)
  - Indicador **"Tú"** (icono de estrella) si el usuario es el que tiene la sesión activa
  - Botones de acción: **Editar**, **Desactivar/Activar**, **Eliminar**
- Botón **"Crear Usuario"** (ícono de persona con signo +)
- **Formulario de creación** (se despliega al presionar "Crear Usuario"):
  - Campo: Nombre completo (obligatorio)
  - Campo: Correo electrónico (obligatorio)
  - Campo: Contraseña con reglas de validación en tiempo real:
    - Mínimo 8 caracteres
    - Una mayúscula
    - Una minúscula
    - Un número
    - Un carácter especial (!@#$%^&*)
  - Botón de mostrar/ocultar contraseña (icono de ojo)
  - Selector de Rol (Usuario / Administrador)
  - Botones **"Crear"** y **"Cancelar"**
- **Modal de edición** (se abre al presionar "Editar"):
  - Campo: Nombre
  - Selector de Rol (Usuario / Administrador)
  - Botones **"Guardar"** y **"Cancelar"**

---

### Acciones Disponibles

#### Crear Usuario
1. Presionar el botón **"Crear Usuario"**
2. Completar los campos: Nombre, Correo electrónico, Contraseña (cumpliendo todas las reglas), Rol
3. Las reglas de contraseña se validan en tiempo real con indicadores visuales (check verde cuando se cumple la regla)
4. Presionar **"Crear"** cuando todos los campos sean válidos
5. Aparece un mensaje de confirmación: `Usuario "[Nombre]" creado exitosamente`
6. Si hay error (correo duplicado, etc.), se muestra un alerta con el mensaje de error

#### Editar Usuario
1. Presionar **"Editar"** en la tarjeta del usuario a modificar
2. Se abre un modal con los campos: Nombre y Rol
3. Modificar los campos deseados
4. Presionar **"Guardar"** para aplicar los cambios
5. Aparece un toast de confirmación: `Usuario actualizado`

#### Activar / Desactivar Usuario
1. Presionar **"Desactivar"** (o **"Activar"** si está inactivo) en la tarjeta del usuario
2. Se muestra un diálogo de confirmación: `¿Estás seguro de desactivar/activar a "[Nombre]"?`
3. Presionar la acción correspondiente para confirmar o **"Cancelar"** para abortar
4. Aparece un toast: `Usuario desactivado` o `Usuario activado`

#### Eliminar Usuario
1. Presionar **"Eliminar"** en la tarjeta del usuario (no aparece para el usuario actual)
2. Se muestra un diálogo de confirmación: `¿Estás seguro de eliminar a "[Nombre]"? Esta acción no se puede deshacer.`
3. Presionar **"Eliminar"** (en rojo) para confirmar o **"Cancelar"** para abortar
4. Aparece un toast: `Usuario eliminado`
5. **Nota:** No se permite eliminar la propia cuenta del usuario actual; el botón "Eliminar" no se muestra para el usuario en sesión

---

### Reglas de Validación de Contraseña

| Regla | Descripción |
|-------|-------------|
| Longitud mínima | 8 caracteres |
| Mayúscula | Al menos una letra en mayúscula (A-Z) |
| Minúscula | Al menos una letra en minúscula (a-z) |
| Número | Al menos un dígito (0-9) |
| Carácter especial | Al menos un carácter especial (!@#$%^&*) |

Las reglas se muestran en tiempo real mientras se escribe la contraseña, con un ícono de check verde cuando la regla se cumple y un círculo vacío cuando no.

---

### Restricciones

- Solo los usuarios con rol **Administrador** pueden acceder a esta pantalla
- El usuario actual **no puede eliminar su propia cuenta** (el botón "Eliminar" no se muestra)
- El botón **"Crear"** se deshabilita mientras no se cumplan todas las validaciones
- El botón **"Guardar"** en el modal de edición se deshabilita si el nombre está vacío

---

### Flujo de Navegación

```
┌─────────────────────┐
│   Menú Principal     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Gestión de Usuarios  │
└──────────┬──────────┘
           │
     ┌─────┼─────┐
     ▼     ▼     ▼
┌────────┐ ┌────────┐ ┌────────┐
│ Crear  │ │ Editar │ │Eliminar│
│ Usuario│ │ Modal  │ │Confirm │
└────────┘ └────────┘ └────────┘
```

---

## Cambios en la Pantalla Formulario de Evaluación

A continuación se enumeran los cambios detectados en la pantalla **Formulario de Evaluación** con respecto a lo documentado en el README principal:

### 1. Campo de Presión Arterial dividido en dos campos

**README original:**
- Campo: **Presión Arterial en Reposo** (mmHg)

**Estado actual:**
- Campo: **Presión Sistólica en Reposo** (mmHg) — Ej: 120
- Campo: **Presión Diastólica en Reposo** (mmHg) — Ej: 80

> **Cambio:** El campo único de presión arterial se ha separado en dos campos independientes: sistólica y diastólica. Esto permite una evaluación más precisa de la presión sanguínea del paciente, ya que tanto la sistólica como la diastólica son indicadores clínicos relevantes para el riesgo cardiovascular. Se agregaron validaciones: sistólica (80-250 mmHg) y diastólica (40-150 mmHg).

---

### 2. Notas de campo (field-hint) añadidas

**README original:**
- No se mencionan notas explicativas bajo los campos

**Estado actual:**
- Cada campo de Medidas Corporales y ECG incluye una nota descriptiva debajo del input:
  - `Presión sistólica medida en reposo (mm Hg)`
  - `Presión diastólica medida en reposo (mm Hg)`
  - `Colesterol sérico total (mg/dL)`
  - `Frecuencia cardíaca máxima alcanzada (bpm)`
  - `Resultado del electrocardiograma en reposo`
  - `Depresión del segmento ST medida en el ECG tras el ejercicio`
  - `Pendiente del segmento ST durante el ejercicio máximo`

> **Cambio:** Se han añadido guías descriptivas bajo cada campo para mejorar la comprensión del usuario sobre qué dato debe ingresar.

---

### 3. Badges de auto-completado con etiqueta "Auto"

**README original:**
- Los campos auto-completados muestran una etiqueta **"Auto"** en verde (ya mencionado)

**Estado actual:** Mantiene la funcionalidad, pero ahora aplica a cuatro campos:
- Frecuencia Cardíaca Máxima
- ECG en Reposo
- Depresión del ST
- Pendiente del ST

> **Cambio:** Se confirma que la funcionalidad de auto-completado desde imagen de ECG ahora cubre cuatro campos (antes solo se mencionaban de forma genérica). Cada campo auto-completado muestra un badge verde con el texto "Auto" junto al label del campo.

---

### 4. Toast de notificación de auto-completado mejorado

**README original:**
- No se describe el toast de notificación

**Estado actual:**
- Se muestra un toast con el mensaje: `Datos auto-completados desde la imagen: [campo1, campo2, ...]`
- Duración: 5 segundos
- Color: verde (success)
- Botón "OK" para descartar

> **Cambio:** Nuevo comportamiento de notificación que informa al usuario qué campos específicos fueron auto-completados desde la imagen del ECG.

---

### 5. Spinner de carga en botón de submit

**README original:**
- El botón se deshabilita mientras se procesa la evaluación

**Estado actual:**
- El botón muestra un **spinner animado** (crescent) mientras se procesa la predicción, además de deshabilitarse
- El texto del botón se oculta y solo se muestra el spinner durante el procesamiento

> **Cambio:** Se mejoró la experiencia de usuario al agregar un indicador visual de carga animado en el botón de predicción, en lugar de solo deshabilitarlo.

---

### 6. Spinner de carga en interpretación de ECG

**README original:**
- No se menciona spinner durante la interpretación de la imagen

**Estado actual:**
- Se muestra un **spinner animado** (crescent) debajo del botón de selección de imagen mientras se interpreta el ECG
- El botón de selección muestra el texto `Interpretando...` y se deshabilita

> **Cambio:** Se agregó feedback visual durante la interpretación de la imagen del ECG para que el usuario sepa que el proceso está en curso.

---

### 7. Vista previa de imagen del ECG

**README original:**
- No se describe vista previa de imagen

**Estado actual:**
- Se muestra una **vista previa** de la imagen del ECG seleccionada debajo del botón de carga
- La imagen se comprime automáticamente a un máximo de 1200px de dimensión y formato JPEG al 85% de calidad

> **Cambio:** El usuario puede ver la imagen que seleccionó antes de que se envíe para interpretación, lo que permite confirmar que seleccionó la imagen correcta.

---

### 8. Validaciones de campos numéricos

**README original:**
- No se describen rangos de validación

**Estado actual:**
- Edad: 1-120 años
- Presión Sistólica: 80-250 mmHg
- Presión Diastólica: 40-150 mmHg
- Colesterol: 100-600 mg/dL
- FC Máxima: 60-250 bpm
- Depresión del ST: 0-10

> **Cambio:** Se agregaron rangos de validación numérica en todos los campos del formulario para evitar la entrada de datos clínicamente imposibles.

---

### Resumen de Cambios

| Aspecto | README Original | Estado Actual |
|---------|-----------------|---------------|
| Presión Arterial | 1 campo | 2 campos (Sistólica + Diastólica) |
| Notas de campo | No existen | 7 notas descriptivas añadidas |
| Auto-completado ECG | Mencionado genéricamente | 4 campos con badge "Auto" |
| Toast notificación | No descrito | Toast con campos específicos (5s) |
| Spinner submit | Solo deshabilitado | Spinner animado + deshabilitado |
| Spinner ECG | No descrito | Spinner + texto "Interpretando..." |
| Vista previa imagen | No descrita | Vista previa comprimida JPEG |
| Validaciones numéricas | No descritas | 6 rangos de validación definidos |
