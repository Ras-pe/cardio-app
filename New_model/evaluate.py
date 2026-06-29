import pandas as pd
import numpy as np
import joblib
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, roc_curve, confusion_matrix, classification_report
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, 'evaluation_output')
os.makedirs(OUTPUT_DIR, exist_ok=True)

df = pd.read_csv(os.path.join(BASE_DIR, 'heart.csv'))
pipeline = joblib.load(os.path.join(BASE_DIR, 'heart_model_v2.pkl'))

X = df.drop('HeartDisease', axis=1)
y = df['HeartDisease']

y_pred = pipeline.predict(X)
y_proba = pipeline.predict_proba(X)[:, 1]

accuracy = accuracy_score(y, y_pred)
precision = precision_score(y, y_pred)
recall = recall_score(y, y_pred)
f1 = f1_score(y, y_pred)
roc_auc = roc_auc_score(y, y_proba)

print("=" * 60)
print("EVALUACIÓN DEL MODELO - PREDICCIÓN DE ENFERMEDAD CARDÍACA")
print("=" * 60)

print(f"\n{'Dataset':30s}: {len(df)} registros, {len(X.columns)} features")
print(f"{'Target 0 (Sin riesgo)':30s}: {(y==0).sum()} ({((y==0).sum()/len(y))*100:.1f}%)")
print(f"{'Target 1 (Con riesgo)':30s}: {(y==1).sum()} ({((y==1).sum()/len(y))*100:.1f}%)")

print(f"\n{'--- MÉTRICAS DE EFECTIVIDAD ---':^60s}")
print(f"{'Accuracy':30s}: {accuracy:.4f}  ({accuracy*100:.2f}%)")
print(f"{'Precision':30s}: {precision:.4f}  ({precision*100:.2f}%)")
print(f"{'Recall (Sensibilidad)':30s}: {recall:.4f}  ({recall*100:.2f}%)")
print(f"{'F1-Score':30s}: {f1:.4f}  ({f1*100:.2f}%)")
print(f"{'ROC-AUC':30s}: {roc_auc:.4f}  ({roc_auc*100:.2f}%)")

tn, fp, fn, tp = confusion_matrix(y, y_pred).ravel()
print(f"\n{'--- MATRIZ DE CONFUSIÓN ---':^60s}")
print(f"{'':>10}{'Pred 0':>12}{'Pred 1':>12}")
print(f"{'Real 0':>10}{tn:>12}{fp:>12}")
print(f"{'Real 1':>10}{fn:>12}{tp:>12}")
total_errors = fp + fn
print(f"\n{'Errores totales':30s}: {total_errors} / {len(y)} ({total_errors/len(y)*100:.2f}%)")
print(f"{'Falsos Positivos':30s}: {fp} ({fp/len(y)*100:.2f}%)")
print(f"{'Falsos Negativos':30s}: {fn} ({fn/len(y)*100:.2f}%)")

print(f"\n{'--- CLASSIFICATION REPORT ---':^60s}")
print(classification_report(y, y_pred, target_names=['Sin riesgo', 'Con riesgo']))

print("\n" + "=" * 60)
print("RELACIÓN DE TODAS LAS VARIABLES")
print("=" * 60)

print(f"\n{'--- ESTADÍSTICAS DESCRIPTIVAS ---':^60s}")
print(df.describe(include='all').to_string())

print(f"\n{'--- CORRELACIÓN CON EL TARGET ---':^60s}")
numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
if 'HeartDisease' in numeric_cols:
    numeric_cols.remove('HeartDisease')
correlations = df[numeric_cols + ['HeartDisease']].corr()['HeartDisease'].drop('HeartDisease').sort_values(key=abs, ascending=False)
for feature, corr in correlations.items():
    direction = "positiva" if corr > 0 else "negativa"
    strength = "fuerte" if abs(corr) > 0.5 else ("moderada" if abs(corr) > 0.3 else "débil")
    print(f"  {feature:25s}: {corr:+.4f}  ({direction}, {strength})")

print(f"\n{'--- DISTRIBUCIÓN POR TARGET ---':^60s}")
categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
for col in categorical_cols:
    print(f"\n  {col}:")
    cross = pd.crosstab(df[col], df['HeartDisease'], margins=True, normalize='index') * 100
    print(cross.round(1).to_string())

print(f"\n{'--- IMPORTANCIA DE FEATURES (RandomForest) ---':^60s}")
try:
    rf_model = pipeline.named_steps['classifier']
    preprocessor = pipeline.named_steps['preprocessor']

    cat_encoder = preprocessor.named_transformers_['cat']
    cat_features_encoded = cat_encoder.get_feature_names_out(categorical_cols)

    all_encoded_features = list(numeric_cols) + list(cat_features_encoded)
    importances = rf_model.feature_importances_
    indices = np.argsort(importances)[::-1]

    print(f"\n  {'#':<4} {'Feature':<30} {'Importancia':<12} {'Acumulado':<10}")
    print(f"  {'-'*56}")
    cumsum = 0
    for i, idx in enumerate(indices):
        cumsum += importances[idx]
        print(f"  {i+1:<4} {all_encoded_features[idx]:<30} {importances[idx]:.4f}       {cumsum:.4f}")

    plt.figure(figsize=(12, 8))
    colors = plt.cm.Blues(np.linspace(0.3, 0.9, len(indices)))[::-1]
    bars = plt.barh(range(len(indices)), importances[indices], color=colors)
    plt.yticks(range(len(indices)), [all_encoded_features[i] for i in indices])
    plt.xlabel('Importancia')
    plt.title('Importancia de Features (Random Forest)', fontsize=14, fontweight='bold')
    plt.gca().invert_yaxis()
    for bar, val in zip(bars, importances[indices]):
        plt.text(bar.get_width() + 0.002, bar.get_y() + bar.get_height()/2,
                 f'{val:.3f}', va='center', fontsize=9)
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'feature_importance.png'), dpi=150)
    print(f"\n  Gráfico guardado: {OUTPUT_DIR}/feature_importance.png")
except Exception as e:
    print(f"  Error calculando importancia: {e}")

fpr, tpr, _ = roc_curve(y, y_proba)
plt.figure(figsize=(8, 6))
plt.plot(fpr, tpr, 'b-', linewidth=2, label=f'ROC-AUC = {roc_auc:.3f}')
plt.plot([0, 1], [0, 1], 'k--', alpha=0.5, label='Aleatorio')
plt.fill_between(fpr, tpr, alpha=0.15, color='blue')
plt.xlabel('Tasa de Falsos Positivos (1 - Especificidad)', fontsize=11)
plt.ylabel('Tasa de Verdaderos Positivos (Sensibilidad)', fontsize=11)
plt.title('Curva ROC', fontsize=14, fontweight='bold')
plt.legend(loc='lower right')
plt.grid(alpha=0.3)
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, 'roc_curve.png'), dpi=150)
print(f"  Gráfico guardado: {OUTPUT_DIR}/roc_curve.png")

plt.figure(figsize=(10, 8))
corr_matrix = df.select_dtypes(include=[np.number]).corr()
mask = np.triu(np.ones_like(corr_matrix, dtype=bool))
sns.heatmap(corr_matrix, mask=mask, annot=True, fmt='.2f', cmap='RdBu_r',
            center=0, square=True, linewidths=0.5,
            cbar_kws={'shrink': 0.8})
plt.title('Matriz de Correlación (Variables Numéricas)', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, 'correlation_matrix.png'), dpi=150)
print(f"  Gráfico guardado: {OUTPUT_DIR}/correlation_matrix.png")

print("\n" + "=" * 60)
print("RESUMEN FINAL")
print("=" * 60)
print(f"  Efectividad (Accuracy):          {accuracy*100:.2f}%")
print(f"  ROC-AUC:                         {roc_auc:.4f}")
print(f"  El modelo acierta {(y_pred == y).sum()} de {len(y)} casos")
print(f"  Features más importante:          {all_encoded_features[indices[0]] if 'rf_model' in dir() else 'N/A'}")
print(f"\n  Reportes guardados en: {OUTPUT_DIR}/")
print("=" * 60)
