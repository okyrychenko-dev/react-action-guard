export function actionChipColor(action: string): "success" | "danger" | "warning" | "default" {
  switch (action) {
    case "add":
      return "warning";
    case "remove":
      return "success";
    case "timeout":
      return "danger";
    default:
      return "default";
  }
}
