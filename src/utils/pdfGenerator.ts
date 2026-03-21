import jsPDF from "jspdf";
import { BusinessPlan } from "@/types/business";

export async function generateBusinessPlanPDF(
  plan: BusinessPlan,
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const addTitle = (text: string, size = 16) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 100, 100);
    doc.text(text, margin, y);
    y += size * 0.5 + 4;
  };

  const addSubtitle = (text: string) => {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text(text, margin, y);
    y += 8;
  };

  const addText = (text: string, indent = 0) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    doc.text(lines, margin + indent, y);
    y += lines.length * 5 + 2;
  };

  const addBulletPoint = (text: string) => {
    addText(`• ${text}`, 5);
  };

  const addKeyValue = (key: string, value: string) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text(`${key}: `, margin, y);
    const keyWidth = doc.getTextWidth(`${key}: `);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(value, margin + keyWidth, y);
    y += 6;
  };

  const checkPageBreak = (neededSpace = 40) => {
    if (y > doc.internal.pageSize.getHeight() - neededSpace) {
      doc.addPage();
      y = 20;
    }
  };

  const addSectionDivider = () => {
    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
  };

  // Header
  addTitle("SmartBiz AI - Business Plan", 20);
  y += 5;

  // Business Overview
  addTitle(plan.idea.name, 16);
  addText(plan.idea.description);
  y += 5;

  // Key Metrics
  addSubtitle("Key Metrics");
  addKeyValue("Investment Range", plan.idea.investmentRange);
  addKeyValue("Expected Revenue", plan.idea.expectedRevenue);
  addKeyValue("Profit Margin", plan.idea.profitMargin);
  addKeyValue("Risk Level", plan.idea.riskLevel);
  addKeyValue("Break-even Time", plan.idea.breakEvenTime);

  addSectionDivider();
  checkPageBreak();

  // Raw Materials Section
  addTitle("Raw Material & Supplier Guidance", 14);
  plan.rawMaterials?.forEach((material) => {
    checkPageBreak(30);
    addSubtitle(material.name);
    addKeyValue("Source", material.sourceType);
    addKeyValue("Estimated Cost", material.estimatedCost);
    addText(`Tip: ${material.tips}`);
    y += 3;
  });

  addSectionDivider();
  checkPageBreak();

  // Workforce Section
  addTitle("Skill & Workforce Requirements", 14);
  plan.workforce?.forEach((worker) => {
    checkPageBreak(20);
    addKeyValue("Role", worker.role);
    addKeyValue("Skill Level", worker.skillLevel);
    addKeyValue("Count", worker.count.toString());
    addKeyValue("Salary", worker.estimatedSalary);
    y += 3;
  });

  addSectionDivider();
  checkPageBreak();

  // Location Section
  addTitle("Offline Setup & Location Advice", 14);
  if (plan.location) {
    addKeyValue("Area Type", plan.location.areaType);
    addKeyValue("Shop Size", plan.location.shopSize);
    addKeyValue("Rent Estimate", plan.location.rentEstimate);
    y += 3;
    addSubtitle("Setup Requirements:");
    plan.location.setupNeeds?.forEach((need) => {
      checkPageBreak(10);
      addBulletPoint(need);
    });
  }

  addSectionDivider();
  checkPageBreak();

  // Pricing Section
  addTitle("Pricing Strategy", 14);
  if (plan.pricing) {
    addSubtitle("Cost Components:");
    plan.pricing.costComponents?.forEach((component) => {
      checkPageBreak(10);
      addBulletPoint(component);
    });
    y += 3;
    addKeyValue("Cost Price", plan.pricing.costPrice);
    addKeyValue("Market Price Range", plan.pricing.marketPriceRange);
    addKeyValue("Suggested Price", plan.pricing.suggestedPrice);
    addKeyValue("Profit Margin", plan.pricing.profitMargin);
  }

  addSectionDivider();
  checkPageBreak();

  // Marketing Section
  addTitle("Marketing & Advertising Plan", 14);
  if (plan.marketing) {
    addSubtitle("30-Day Launch Plan:");
    plan.marketing.launchPlan?.forEach((step) => {
      checkPageBreak(10);
      addBulletPoint(step);
    });
    y += 3;

    checkPageBreak(30);
    addSubtitle("Online Strategies:");
    plan.marketing.onlineStrategies?.forEach((strategy) => {
      checkPageBreak(10);
      addBulletPoint(strategy);
    });
    y += 3;

    checkPageBreak(30);
    addSubtitle("Offline Strategies:");
    plan.marketing.offlineStrategies?.forEach((strategy) => {
      checkPageBreak(10);
      addBulletPoint(strategy);
    });
    y += 3;

    checkPageBreak(30);
    addSubtitle("Low-Budget Ideas:");
    plan.marketing.lowBudgetIdeas?.forEach((idea) => {
      checkPageBreak(10);
      addBulletPoint(idea);
    });
  }

  addSectionDivider();
  checkPageBreak();

  // Growth Section
  addTitle("Business Growth Roadmap", 14);
  if (plan.growth) {
    addSubtitle("Month 1-3: Foundation");
    plan.growth.month1to3?.forEach((action) => {
      checkPageBreak(10);
      addBulletPoint(action);
    });
    y += 3;

    checkPageBreak(30);
    addSubtitle("Month 4-6: Growth");
    plan.growth.month4to6?.forEach((action) => {
      checkPageBreak(10);
      addBulletPoint(action);
    });
    y += 3;

    checkPageBreak(30);
    addSubtitle("Expansion Ideas:");
    plan.growth.expansionIdeas?.forEach((idea) => {
      checkPageBreak(10);
      addBulletPoint(idea);
    });
    y += 3;

    checkPageBreak(30);
    addSubtitle("Common Mistakes to Avoid:");
    plan.growth.mistakesToAvoid?.forEach((mistake) => {
      checkPageBreak(10);
      addBulletPoint(mistake);
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generated by SmartBiz AI | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" },
    );
  }

  // Save the PDF
  const fileName = `${plan.idea.name.replace(/\s+/g, "_")}_Business_Plan.pdf`;
  doc.save(fileName);
}
