"""
Generate PricePoint Project Report PDF with Formal Cover Page.
Includes:
- Elegant Cover Page with Title, Subtitle, Project Details, Student Names, and ID/Roll Numbers.
- Page break after Cover Page.
- Problem Description, Methodology, Results and Analysis, Implementation Details.
- Running headers and dynamic page numbers (Page X of Y) starting after the cover.
"""

from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
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

        # Omit running headers and footers on Cover Page (Page 1)
        if self._pageNumber > 1:
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748b"))

            # Running header
            self.drawString(54, letter[1] - 36, "PricePoint — Intelligent Laptop Market Valuation System")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, letter[1] - 42, letter[0] - 54, letter[1] - 42)

            # Footer
            page_str = f"Page {self._pageNumber} of {total_pages}"
            self.drawRightString(letter[0] - 54, 36, page_str)
            self.drawString(54, 36, "Machine Learning Project Documentation")
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

    primary_color = colors.HexColor("#0f172a")
    accent_blue = colors.HexColor("#2563eb")
    text_dark = colors.HexColor("#334155")
    bg_light = colors.HexColor("#f8fafc")

    # Cover Page Styles
    cover_tag_style = ParagraphStyle(
        "CoverTag",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        textColor=accent_blue,
        alignment=0,
        spaceAfter=12,
    )

    cover_title_style = ParagraphStyle(
        "CoverTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=28,
        leading=34,
        textColor=primary_color,
        alignment=0,
        spaceAfter=8,
    )

    cover_subtitle_style = ParagraphStyle(
        "CoverSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=13,
        leading=18,
        textColor=colors.HexColor("#475569"),
        alignment=0,
        spaceAfter=20,
    )

    cover_desc_style = ParagraphStyle(
        "CoverDesc",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=15,
        textColor=colors.HexColor("#475569"),
        alignment=0,
        spaceAfter=24,
    )

    section_box_title = ParagraphStyle(
        "BoxTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=14,
        textColor=primary_color,
        spaceAfter=8,
    )

    member_name_style = ParagraphStyle(
        "MemberName",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#0f172a"),
    )

    member_role_style = ParagraphStyle(
        "MemberRole",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#64748b"),
    )

    member_id_style = ParagraphStyle(
        "MemberID",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=12,
        textColor=accent_blue,
        alignment=2,
    )

    # Document Section Styles
    h1_style = ParagraphStyle(
        "Heading1_Custom",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=primary_color,
        spaceBefore=12,
        spaceAfter=5,
        keepWithNext=True,
    )

    h2_style = ParagraphStyle(
        "Heading2_Custom",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#1e293b"),
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True,
    )

    body_style = ParagraphStyle(
        "Body_Custom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=13,
        textColor=text_dark,
        spaceAfter=6,
    )

    bullet_style = ParagraphStyle(
        "Bullet_Custom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=12,
        textColor=text_dark,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=2.5,
    )

    code_style = ParagraphStyle(
        "CodeBlock",
        parent=styles["Normal"],
        fontName="Courier",
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#0f172a"),
        backColor=colors.HexColor("#f1f5f9"),
        borderPadding=5,
        spaceAfter=6,
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
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor("#1e293b"),
    )

    table_cell_bold = ParagraphStyle(
        "TableCellBold",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor("#0f172a"),
    )

    table_cell_center = ParagraphStyle(
        "TableCellCenter",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7.5,
        leading=9.5,
        alignment=1,
        textColor=colors.HexColor("#1e293b"),
    )

    story = []

    # =========================================================================
    # COVER PAGE
    # =========================================================================
    story.append(Spacer(1, 15))
    story.append(Paragraph("MACHINE LEARNING COURSE PROJECT REPORT", cover_tag_style))
    story.append(Paragraph("PricePoint: Intelligent Laptop Market Valuation System", cover_title_style))
    story.append(Paragraph("Empirical Evaluation of Regression Algorithms and Serverless In-Browser Inference", cover_subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=accent_blue, spaceAfter=18))

    story.append(Paragraph(
        "An end-to-end data science study analyzing 1,303 laptop configurations. "
        "The project rigorously benchmarks 6 supervised machine learning regression paradigms, evaluates "
        "feature interactions through 5-fold cross-validation, and implements a zero-latency client-side "
        "tree ensemble inference architecture deployed live on GitHub Pages.",
        cover_desc_style
    ))

    story.append(Spacer(1, 25))
    story.append(Paragraph("Project Team & Contributors", section_box_title))

    # Contributors Table
    contributors_data = [
        [
            Paragraph("Team Member & Contributions", table_header_style),
            Paragraph("Role", table_header_style),
            Paragraph("Student ID / Roll", table_header_style),
        ],
        [
            Paragraph("<b>Salman</b><br/><font color='#64748b' size=7>System Architecture, Random Forest, SVR, Web App, Deployment, Tuning</font>", member_name_style),
            Paragraph("Team Lead", table_cell_center),
            Paragraph("0112430508", member_id_style),
        ],
        [
            Paragraph("<b>Mehedi</b><br/><font color='#64748b' size=7>Linear Regression Module, Preprocessing Benchmarks</font>", member_name_style),
            Paragraph("Contributor", table_cell_center),
            Paragraph("0112410105", member_id_style),
        ],
        [
            Paragraph("<b>Maruf</b><br/><font color='#64748b' size=7>Decision Tree Regression, Overfitting Analysis</font>", member_name_style),
            Paragraph("Contributor", table_cell_center),
            Paragraph("0112330918", member_id_style),
        ],
        [
            Paragraph("<b>Jannat</b><br/><font color='#64748b' size=7>KNN Regression, Gradient Boosting & Error Analysis</font>", member_name_style),
            Paragraph("Contributor", table_cell_center),
            Paragraph("0112330157", member_id_style),
        ],
    ]

    team_table = Table(contributors_data, colWidths=[270, 110, 124])
    team_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), primary_color),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("BACKGROUND", (0, 1), (-1, 1), colors.HexColor("#f0fdf4")),
        ("ROWBACKGROUNDS", (0, 2), (-1, -1), [colors.white, bg_light]),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(team_table)

    story.append(Spacer(1, 40))

    # Project metadata footer on cover
    meta_box = [
        [
            Paragraph("<b>Live Demo:</b> https://deepsalman.github.io/PricePoint/", table_cell_style),
            Paragraph("<b>Target Currency:</b> BDT (৳)", table_cell_center),
        ],
        [
            Paragraph("<b>Source Code:</b> https://github.com/DeepSalman/PricePoint", table_cell_style),
            Paragraph("<b>Framework:</b> scikit-learn / Pure ES6", table_cell_center),
        ],
    ]
    meta_table = Table(meta_box, colWidths=[360, 144])
    meta_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LINEABOVE", (0, 0), (-1, 0), 0.5, colors.HexColor("#cbd5e1")),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(meta_table)

    # Page break to start report content on Page 2
    story.append(PageBreak())

    # =========================================================================
    # SECTION 1: PROBLEM DESCRIPTION
    # =========================================================================
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

    # =========================================================================
    # SECTION 2: METHODOLOGY
    # =========================================================================
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
    story.append(Paragraph("To identify the optimal model, six distinct machine learning algorithms were trained and evaluated:", body_style))
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

    # =========================================================================
    # SECTION 3: RESULTS AND ANALYSIS
    # =========================================================================
    story.append(Paragraph("3. Results and Analysis", h1_style))
    story.append(Paragraph(
        "Models were scored using Mean Absolute Error (MAE in BDT), Root Mean Squared Error (RMSE), and the Coefficient of Determination (R² Score).",
        body_style
    ))

    # Results Table
    col_widths = [140, 72, 72, 72, 64, 84]
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
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("BACKGROUND", (0, 1), (-1, 1), colors.HexColor("#ecfdf5")),
        ("ROWBACKGROUNDS", (0, 2), (-1, -1), [colors.white, bg_light]),
        ("TOPPADDING", (0, 0), (-1, -1), 4.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4.5),
    ]))
    story.append(results_table)

    story.append(Paragraph("3.1 Key Architectural Insights", h2_style))
    story.append(Paragraph("• <b>Gradient Boosting Superiority:</b> Gradient Boosting achieved the highest R² score (0.8534) and lowest test MAE (৳ 21,433). Because it fits sequential trees to residual errors, it excels at learning subtle spec combinations.", bullet_style))
    story.append(Paragraph("• <b>Failure of Linear Models:</b> Linear Regression exhibited the worst performance (MAE ৳ 41,016). Linear combinations fail because high-end brands (e.g. Apple) have compounding pricing multipliers rather than constant addition.", bullet_style))
    story.append(Paragraph("• <b>Tree Bagging vs Boosting:</b> Random Forest performed admirably (R² = 0.8259), but Gradient Boosting's focused gradient descent in function space yielded tighter pricing boundaries on premium models.", bullet_style))
    story.append(Paragraph("• <b>Feature Scaling Necessity:</b> SVR and KNN only became competitive once features were normalized with StandardScaler and targets were log-transformed.", bullet_style))

    # =========================================================================
    # SECTION 4: IMPLEMENTATION DETAILS
    # =========================================================================
    story.append(Paragraph("4. Implementation Details", h1_style))
    story.append(Paragraph("4.1 Serverless Zero-Latency In-Browser Engine", h2_style))
    story.append(Paragraph(
        "To achieve instant client valuations without cloud hosting costs, the trained scikit-learn Gradient Boosting ensemble is exported into a compact JSON tree structure (<b>model_data.json</b>, ~79 KB). "
        "A native ES-module JavaScript engine (<b>predictor.js</b>) traverses 120 binary decision trees iteratively in less than <b>1 millisecond</b> directly in the user's browser, completely offline-capable.",
        body_style
    ))

    story.append(Paragraph("4.2 Domain-Aware Market Calibration", h2_style))
    story.append(Paragraph(
        "PricePoint blends raw ML inference with secondary market dynamics: <b>Release Era Depreciation</b> (modern 2024–2026 hardware receives +15% generation headroom, legacy hardware accounts for -35% battery/silicon wear) and <b>Physical Condition Scaling</b> (Brand New 100%, Excellent 95%, Good 90%, Fair 80%).",
        body_style
    ))

    story.append(Paragraph("4.3 CLI Prediction & Testing Utility", h2_style))
    story.append(Paragraph("A unified command-line tool (<code>ml/src/predict.py</code>) allows side-by-side evaluation across all 6 models:", body_style))
    story.append(Paragraph("$ python3 ml/src/predict.py --all<br/>[Output] Linear: ৳141k | DecisionTree: ৳143k | SVR: ৳142k | KNN: ৳125k | GradientBoosting: ৳139k", code_style))

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Report generated successfully at: {PDF_PATH}")


if __name__ == "__main__":
    build_pdf()
