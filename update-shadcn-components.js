const { spawnSync } = require("child_process");
const fs = require("fs");

// List all files in the components directory (/components/ui/) and remove the .tsx extension
const components = fs.readdirSync("./components/ui/");

components.forEach((component) => {
  // Remove the .tsx extension
  const componentName = component.replace(".tsx", "");
  console.log(`Installing ${componentName}...`);

  // Use spawnSync to simulate 'y' input
  const result = spawnSync("npx", ["shadcn@latest", "add", componentName], {
    input: "y\n",
    stdio: "inherit",
    shell: true,
  });

  if (result.error) {
    console.error(`Error installing ${componentName}:`, result.error);
  }
});

console.log("All components installed successfully!");
