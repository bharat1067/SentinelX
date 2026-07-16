import os
from app.decision_trace.models import ExportedReport

class DecisionReportExporter:
    @staticmethod
    def export_to_file(
        report: ExportedReport,
        target_dir: str
    ) -> str:
        """
        Saves the structured ExportedReport content to a markdown document
        inside the target directory and returns the absolute file path.
        """
        os.makedirs(target_dir, exist_ok=True)
        
        # Create a file-system safe filename (e.g., incident_summary_SES-999.md)
        safe_type = report.report_type.lower().replace(" ", "_")
        filename = f"{safe_type}_{report.session_id}.md"
        filepath = os.path.join(target_dir, filename)

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(report.content)

        print(f"[REPORT-EXPORTER] Exported '{report.report_type}' report for {report.session_id} to {filepath}.")
        return filepath
