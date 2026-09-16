// @ts-check Let TS check this config file

import zotero from "@zotero-plugin/eslint-config";

export default [
  {
    // Zotero translators are JSON-header + JavaScript hybrids that cannot be
    // parsed as plain JS. prefs.js uses the Zotero-preferred formatting.
    ignores: ["addon/translators/", "addon/prefs.js", "userscripts/"],
  },
  ...zotero({
    overrides: [
      {
        files: ["**/*.ts"],
        rules: {
          // We disable this rule here because the template
          // contains some unused examples and variables
          "@typescript-eslint/no-unused-vars": "off",
        },
      },
    ],
  }),
];
