"""
Generate PricePoint Project Report PDF.
Covers: Problem Description, Methodology, Implementation Details, Results and Analysis.
"""

from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

BASE_DIR = Path(__file__).resolve().parent.parent.parent
PDF_PATH = BASE_DIR / "docs" / "PricePoint_Project_Report.pdf"


class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, total_pages):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))

        # Running header (pages 2+)
        if self._pageNumber > 1:
            self.drawString(54, letter[1] - 36, "PricePoint — Intelligent Laptop Market Valuation System")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, letter[1] - 42, letter[0] - 54, letter[1] - 42)

        # Footer on all pages
        page_str = f"Page {self._pageNumber} of {total_pages}"
        self.drawRightString(letter[0] - 54, 36, page_str)
        self.drawString(54, 36, "Academic Project Documentation | UIU & Project Contributors")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 48, letter[0] - 54, 48)
        self.restoreState()


def build_pdf():
    doc = SimpleDocTemplate(
        str(PDF_PATH),
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#0f172a")
    accent_blue = colors.HexColor("#2563eb")
    text_dark = colors.HexColor("#334155")
    bg_light = colors.HexColor("#f8fafc")

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=24,
        leading=28,
        textColor=primary_color,
        spaceAfter=4,
    )

    subtitle_style = ParagraphStyle(
        "DocSubTitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=11,
        leading=15,
        textColor=accent_blue,
        spaceAfter=15,
    )

    meta_style = ParagraphStyle(
        "MetaText",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#64748b"),
    )

    h1_style = ParagraphStyle(
        "Heading1_Custom",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True,
    )

    h2_style = ParagraphStyle(
        "Heading2_Custom",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=14,
        textColor=colors.HexColor("#1e293b"),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True,
    )

    body_style = ParagraphStyle(
        "Body_Custom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13.5,
        textColor=text_dark,
        spaceAfter=7,
    )

    bullet_style = ParagraphStyle(
        "Bullet_Custom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=12.5,
        textColor=text_dark,
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=3,
    )

    code_style = ParagraphStyle(
        "CodeBlock",
        parent=styles["Normal"],
        fontName="Courier",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#0f172a"),
        backColor=colors.HexColor("#f1f5f9"),
        borderPadding=6,
        spaceAfter=8,
    )

    table_header_style = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=colors.white,
        alignment=1,
    )

    table_cell_style = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#1e293b"),
    )

    table_cell_bold = ParagraphStyle(
        "TableCellBold",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#0f172a"),
    )

    table_cell_center = ParagraphStyle(
        "TableCellCenter",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=10,
        alignment=1,
        textColor=colors.HexColor("#1e293b"),
    )

    story = []

    # Title & Header
    story.append(Paragraph("PricePoint: Machine Learning Laptop Valuation System", title_style))
    story.append(Paragraph("Comprehensive Project Report & Technical Documentation", subtitle_style))

    meta_text = "<b>Authors:</b> Salman (@DeepSalman) & Contributors &nbsp;&nbsp;|&nbsp;&nbsp; <b>Deployment:</b> GitHub Pages (Serverless) &nbsp;&nbsp;|&nbsp;&nbsp; <b>Target Currency:</b> BDT (৳)"
    story.append(Paragraph(meta_text, meta_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceAfter=12))

    # 1. Problem Description
    story.append(Paragraph("1. Problem Description", h1_style))
    story.append(Paragraph(
        "In modern consumer electronics and secondary re-commerce markets, determining an accurate, fair market price for laptops is inherently difficult. Unlike commodities with standardized pricing, laptops feature a combinatorial explosion of specifications (CPU microarchitectures, RAM capacities, storage technologies, discrete GPU tiers, display panel quality, and physical condition).",
        body_style
    ))
    story.append(Paragraph("Key challenges motivating this project include:", body_style))
    story.append(Paragraph("• <b>High Feature Non-Linearity:</b> Hardware pricing does not follow simple linear scaling. An additional 16 GB of RAM or a 4K OLED display adds significantly more monetary value to an Apple MacBook or Dell XPS workstation than to an entry-level student notebook.", bullet_style))
    story.append(Paragraph("• <b>Limitations of Heuristic Rules:</b> Simple rule-based or linear regression pricing formulas fail to model complex interactions (e.g., discrete GPUs paired with high-TGP gaming processors versus ultra-low-voltage ultrabooks).", bullet_style))
    story.append(Paragraph("• <b>Deployment Friction in Classical ML:</b> Conventional machine learning systems mandate always-on backend servers (FastAPI/Docker on AWS or Heroku), introducing latency, cold-starts, maintenance liabilities, and ongoing hosting expenses.", bullet_style))
    story.append(Paragraph(
        "<b>Project Goal:</b> Develop a rigorous, benchmarked machine learning pricing engine and deploy it as a zero-latency, serverless in-browser web application accessible worldwide via GitHub Pages.",
        body_style
    ))

    story.append(Spacer(1, 8))

    # 2. Methodology
    story.append(Paragraph("2. Methodology", h1_style))
    story.append(Paragraph(
        "The project followed an end-to-end data science lifecycle encompassing data exploration, string tokenization, robust feature engineering, supervised regression benchmarking, cross-validation, and deployment optimization.",
        body_style
    ))

    story.append(Paragraph("2.1 Dataset & Feature Preprocessing", h2_style))
    story.append(Paragraph(
        "The dataset consists of <b>1,303 laptop entries</b> with extensive hardware attributes. The target variable is <b>price_bdt</b> (Bangladeshi Taka), converted from European retail benchmarks at ~128 BDT per EUR.",
        body_style
    ))
    story.append(Paragraph("The feature space includes <b>6 categorical features</b> and <b>8 numerical features</b>:", body_style))
    story.append(Paragraph("• <b>Categorical:</b> Brand (19 manufacturers), Form Factor Type (6 categories), CPU Brand (6 tiers), Storage Drive Type (4 technologies), GPU Brand (Intel, Nvidia, AMD), and Operating System (6 families).", bullet_style))
    story.append(Paragraph("• <b>Numerical:</b> Screen Size (inches), Weight (kg), RAM (GB), Storage Capacity (GB), CPU Clock Speed (GHz), Resolution Area (total pixels), Touchscreen indicator (0/1), and IPS panel indicator (0/1).", bullet_style))

    story.append(Paragraph(
        "<b>Feature Engineering Highlights:</b> Raw text columns required specialized parsing. Screen descriptions (e.g. <i>'IPS Panel Retina Display 2560x1600'</i>) were decomposed into binary IPS/Touchscreen indicators and total pixel area. Raw storage configurations (e.g. <i>'128GB SSD + 1TB HDD'</i>) were separated into primary capacity and drive technology.",
        body_style
    ))

    story.append(Paragraph("2.2 Benchmarked Algorithms & Training Protocol", h2_style))
    story.append(Paragraph(
        "To identify the optimal model, six distinct machine learning algorithms were trained and evaluated:",
        body_style
    ))
    story.append(Paragraph("1. <b>Linear Regression:</b> Standard Ordinary Least Squares baseline with one-hot encoded categories.", bullet_style))
    story.append(Paragraph("2. <b>Decision Tree Regressor:</b> Single CART decision tree capturing non-linear feature splits.", bullet_style))
    story.append(Paragraph("3. <b>Random Forest Regressor:</b> Bagging ensemble of 100 decorrelated decision trees.", bullet_style))
    story.append(Paragraph("4. <b>Support Vector Regressor (SVR):</b> Non-linear RBF kernel with standard scaling and log-transformed target (<i>TransformedTargetRegressor</i>).", bullet_style))
    story.append(Paragraph("5. <b>K-Nearest Neighbors (KNN):</b> Instance-based distance metric regression, tuned to optimal k=2 via cross-validation.", bullet_style))
    story.append(Paragraph("6. <b>Gradient Boosting Regressor:</b> Sequential boosting ensemble iteratively minimizing squared residuals.", bullet_style))

    story.append(Paragraph(
        "<b>Validation Protocol:</b> The dataset was split into an 85% training set (1,107 samples) and a 15% holdout test set (196 samples) with fixed random seed 42. In addition, <b>5-fold cross-validation</b> was executed across the entire dataset to ensure generalization stability.",
        body_style
    ))

    story.append(Spacer(1, 8))

    # 3. Results and Analysis
    story.append(Paragraph("3. Results and Analysis", h1_style))
    story.append(Paragraph(
        "Models were scored using Mean Absolute Error (MAE in BDT), Root Mean Squared Error (RMSE), and the Coefficient of Determination (R² Score).",
        body_style
    ))

    # Table of Results
    col_widths = [140, 75, 75, 75, 65, 80]
    table_data = [
        [
            Paragraph("Model Architecture", table_header_style),
            Paragraph("Test MAE (৳)", table_header_style),
            Paragraph("Test RMSE (৳)", table_header_style),
            Paragraph("5-Fold CV MAE", table_header_style),
            Paragraph("R² Score", table_header_style),
            Paragraph("Role / Status", table_header_style),
        ],
        [
            Paragraph("<b>Gradient Boosting (120 Trees)</b>", table_cell_bold),
            Paragraph("<b>21,433</b>", table_cell_center),
            Paragraph("<b>36,153</b>", table_cell_center),
            Paragraph("<b>22,738</b>", table_cell_center),
            Paragraph("<b>0.8534</b>", table_cell_center),
            Paragraph("<b>Active Production</b>", table_cell_bold),
        ],
        [
            Paragraph("Random Forest (100 Trees)", table_cell_style),
            Paragraph("23,022", table_cell_center),
            Paragraph("39,431", table_cell_center),
            Paragraph("22,695", table_cell_center),
            Paragraph("0.8259", table_cell_center),
            Paragraph("Ensemble Candidate", table_cell_style),
        ],
        [
            Paragraph("Support Vector Regressor (SVR)", table_cell_style),
            Paragraph("22,027", table_cell_center),
            Paragraph("38,574", table_cell_center),
            Paragraph("23,600", table_cell_center),
            Paragraph("0.8334", table_cell_center),
            Paragraph("Scaled Kernel", table_cell_style),
        ],
        [
            Paragraph("K-Nearest Neighbors (KNN, k=2)", table_cell_style),
            Paragraph("28,185", table_cell_center),
            Paragraph("46,268", table_cell_center),
            Paragraph("28,738", table_cell_center),
            Paragraph("0.7594", table_cell_center),
            Paragraph("Instance Matching", table_cell_style),
        ],
        [
            Paragraph("Decision Tree Regressor", table_cell_style),
            Paragraph("30,412", table_cell_center),
            Paragraph("55,876", table_cell_center),
            Paragraph("29,513", table_cell_center),
            Paragraph("0.6490", table_cell_center),
            Paragraph("Single Tree Baseline", table_cell_style),
        ],
        [
            Paragraph("Linear Regression (One-Hot)", table_cell_style),
            Paragraph("41,016", table_cell_center),
            Paragraph("55,885", table_cell_center),
            Paragraph("40,040", table_cell_center),
            Paragraph("0.6489", table_cell_center),
            Paragraph("Linear Baseline", table_cell_style),
        ],
    ]

    results_table = Table(table_data, colWidths=col_widths)
    results_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), primary_color),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("BACKGROUND", (0, 1), (-1, 1), colors.HexColor("#ecfdf5")),  # Winner row highlight
        ("ROWBACKGROUNDS", (0, 2), (-1, -1), [colors.white, bg_light]),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))

    story.append(results_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("3.1 Key Architectural Insights", h2_style))
    story.append(Paragraph("• <b>Gradient Boosting Superiority:</b> Gradient Boosting achieved the highest R² score (0.8534) and lowest test MAE (৳ 21,433). Because it fits sequential trees to residual errors, it excels at learning subtle spec combinations.", bullet_style))
    story.append(Paragraph("• <b>Failure of Linear Models:</b> Linear Regression exhibited the worst performance (MAE ৳ 41,016). Linear combinations fail because high-end brands (e.g. Apple) have compounding pricing multipliers rather than constant addition.", bullet_style))
    story.append(Paragraph("• <b>Tree Bagging vs Boosting:</b> Random Forest performed admirably (R² = 0.8259), but Gradient Boosting's focused gradient descent in function space yielded tighter pricing boundaries on premium models.", bullet_style))
    story.append(Paragraph("• <b>Feature Scaling Necessity:</b> SVR and KNN only became competitive once features were normalized with StandardScaler and targets were log-transformed.", bullet_style))

    story.append(Spacer(1, 8))

    # 4. Implementation Details
    story.append(Paragraph("4. Implementation Details", h1_style))
    story.append(Paragraph(
        "The project is structured into two cleanly decoupled environments: an offline Python ML research suite and a standalone client-side web application.",
        body_style
    ))

    story.append(Paragraph("4.1 Serverless Zero-Latency In-Browser Engine", h2_style))
    story.append(Paragraph(
        "To achieve instant client valuations without cloud hosting costs, the trained scikit-learn Gradient Boosting ensemble is exported into a compact JSON tree structure (<b>model_data.json</b>, ~79 KB).",
        body_style
    ))
    story.append(Paragraph(
        "A native ES-module JavaScript engine (<b>predictor.js</b>) executes client-side inference:",
        body_style
    ))
    story.append(Paragraph("1. Categorical inputs are one-hot encoded in real-time matching the training feature vector.", bullet_style))
    story.append(Paragraph("2. The engine traverses 120 binary decision trees iteratively (left/right threshold evaluation).", bullet_style))
    story.append(Paragraph("3. Tree values are scaled by the learning rate (0.08) and summed with the initial base expectation.", bullet_style))
    story.append(Paragraph("4. Predictions evaluate in less than <b>1 millisecond</b> directly in the user's browser, completely offline-capable.", bullet_style))

    story.append(Paragraph("4.2 Domain-Aware Market Calibration", h2_style))
    story.append(Paragraph(
        "Real-world laptop pricing depends on factors beyond raw spec sheets. PricePoint combines raw ML model inference with secondary market parameters:",
        body_style
    ))
    story.append(Paragraph("• <b>Release Era Depreciation:</b> Training data covers 2015–2020 listings. Modern 2024–2026 hardware receives a bounded generation factor (+15%), while legacy systems account for generational battery/silicon wear (-35%).", bullet_style))
    story.append(Paragraph("• <b>Cosmetic Condition Scaling:</b> Real used market pricing reflects condition grades (Brand New 100%, Excellent 95%, Good 90%, Fair 80%).", bullet_style))

    story.append(Paragraph("4.3 CLI Prediction & Testing Utility", h2_style))
    story.append(Paragraph("A unified command-line tool (<code>ml/src/predict.py</code>) allows side-by-side evaluation across all 6 models:", body_style))
    story.append(Paragraph("$ python3 ml/src/predict.py --all<br/>[Output] Linear: ৳141k | DecisionTree: ৳143k | SVR: ৳142k | KNN: ৳125k | GradientBoosting: ৳139k", code_style))

    story.append(Spacer(1, 8))

    # 5. Conclusion & Future Work
    story.append(Paragraph("5. Conclusion & Future Work", h1_style))
    story.append(Paragraph(
        "PricePoint demonstrates that sophisticated ensemble machine learning can be successfully packaged and deployed directly into static web environments without server dependencies. The resulting tool provides accurate, explainable, and zero-latency laptop market valuations.",
        body_style
    ))
    story.append(Paragraph("Planned future improvements include expanding web scrapers for local marketplace price tracking and integrating deep learning embeddings for free-text model descriptions.", body_style))

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Report generated successfully at: {PDF_PATH}")


if __name__ == "__main__":
    build_pdf()
