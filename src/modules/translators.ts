import { config } from "../../package.json";
import { getString } from "../utils/locale";
import { getPref, setPref } from "../utils/prefs";

/**
 * Helper function to log with fallback for early initialization
 */
function logMessage(message: string, ...args: any[]): void {
  try {
    if (addon.data.ztoolkit) {
      addon.data.ztoolkit.log(message, ...args);
    } else {
      // Fallback to console if ztoolkit not yet initialized
      console.log(`[ZoteroFinance] ${message}`, ...args);
    }
  } catch (error) {
    console.log(`[ZoteroFinance] ${message}`, ...args);
  }
}

/**
 * Get translator metadata from file
 * @param translatorCode translator code content
 * @returns translator metadata or null if failed
 */
export function getTranslatorMetadata(translatorCode: string): {
  translatorID: string;
  label: string;
  lastUpdated: string;
} | null {
  try {
    const metadataMatch = translatorCode.match(/^\s*\{[\s\S]*?\}\s*?[\r\n]/);
    if (!metadataMatch) return null;
    
    const metadata = JSON.parse(metadataMatch[0]);
    return {
      translatorID: metadata.translatorID,
      label: metadata.label,
      lastUpdated: metadata.lastUpdated,
    };
  } catch (error) {
    logMessage(`Failed to parse translator metadata: ${error}`);
    return null;
  }
}

/**
 * Get lastUpdated time from installed translator file
 * @param filename translator filename with extension
 * @returns lastUpdated time or false if failed
 */
export async function getInstalledTranslatorLastUpdated(
  filename: string,
): Promise<string | false> {
  const translatorPath = PathUtils.join(
    // @ts-ignore - DataDirectory is available in Zotero
    Zotero.DataDirectory.dir,
    "translators",
    filename,
  );
  
  const isFileExist = await IOUtils.exists(translatorPath);
  if (!isFileExist) {
    logMessage(`Translator file not found: ${translatorPath}`);
    return false;
  }
  
  try {
    // @ts-ignore - File API is available
    const source = (await Zotero.File.getContentsAsync(translatorPath)) as string;
    const metadata = getTranslatorMetadata(source);
    if (metadata) {
      logMessage(
        `Get lastUpdated from installed translator ${filename}: ${metadata.lastUpdated}`,
      );
      return metadata.lastUpdated;
    }
    return false;
  } catch (error) {
    logMessage(`Failed to read translator ${translatorPath}: ${error}`);
    return false;
  }
}

/**
 * Get all bundled translators from plugin package
 * Uses multiple methods to handle both jar: and file: URIs
 * @returns Map of filename to translator code
 */
export async function getBundledTranslators(): Promise<Map<string, string>> {
  const translators = new Map<string, string>();
  
  try {
    // Get the root URI from global context
    const rootURI = (addon.data as any).rootURI || (Zotero as any)[config.addonInstance]?.data?.rootURI;
    
    if (!rootURI) {
      logMessage("WARNING: rootURI not found");
      return translators;
    }
    
    logMessage(`rootURI: ${rootURI}`);
    
    let translatorsDir: string;
    
    // Handle both file: and jar: URIs
    if (rootURI.startsWith("jar:")) {
      // For XPI packages: jar:file:///path/to/addon.xpi!/
      translatorsDir = rootURI + "translators/";
      logMessage(`Jar URI detected: ${translatorsDir}`);
      
      // Try to list using IOUtils.getChildren with jar path
      try {
        const entries = await IOUtils.getChildren(translatorsDir);
        logMessage(`Found ${entries.length} items in translators directory`);
        
        for (const entryPath of entries) {
          const filename = PathUtils.filename(entryPath);
          logMessage(`Processing: ${filename}`);
          
          if (filename.endsWith(".js")) {
            try {
              // For jar: URIs, try using Zotero.File.getContentsAsync first
              // @ts-ignore
              const content = await Zotero.File.getContentsAsync(entryPath);
              translators.set(filename, content as string);
              logMessage(`Loaded translator: ${filename}`);
            } catch (e1) {
              // Fallback to fetch for jar: URIs
              logMessage(`IOUtils failed for ${filename}, trying fetch: ${e1}`);
              try {
                const response = await fetch(entryPath);
                if (response.ok) {
                  const content = await response.text();
                  translators.set(filename, content);
                  logMessage(`Loaded translator via fetch: ${filename}`);
                } else {
                  logMessage(`Fetch failed with status ${response.status} for ${filename}`);
                }
              } catch (e2) {
                logMessage(`Fetch also failed for ${filename}: ${e2}`);
              }
            }
          }
        }
      } catch (dirError) {
        logMessage(`Failed to list jar directory: ${dirError}, trying fallback`);
        // Fallback: try to load known translators directly
        const knownTranslators = ["EastMoney Notices.js", "EastMoney Reports.js"];
        for (const filename of knownTranslators) {
          try {
            const filePath = translatorsDir + filename;
            logMessage(`Fallback: trying to load ${filePath}`);
            const response = await fetch(filePath);
            if (response.ok) {
              const content = await response.text();
              translators.set(filename, content);
              logMessage(`Fallback load successful: ${filename}`);
            }
          } catch (e) {
            logMessage(`Fallback load failed for ${filename}: ${e}`);
          }
        }
      }
    } else {
      // For file: URIs (development mode)
      try {
        // @ts-ignore - File API is available
        const rootFile = Zotero.File.pathToFile(rootURI);
        translatorsDir = PathUtils.join(rootFile.path, "translators");
        logMessage(`File URI detected: ${translatorsDir}`);
        
        const entries = await IOUtils.getChildren(translatorsDir);
        logMessage(`Found ${entries.length} items`);
        
        for (const entryPath of entries) {
          const filename = PathUtils.filename(entryPath);
          if (filename.endsWith(".js")) {
            try {
              // @ts-ignore
              const content = await Zotero.File.getContentsAsync(entryPath);
              translators.set(filename, content as string);
              logMessage(`Loaded translator: ${filename}`);
            } catch (error) {
              logMessage(`Failed to read translator ${filename}: ${error}`);
            }
          }
        }
      } catch (error) {
        logMessage(`Failed to process file URI: ${error}`);
      }
    }
  } catch (error) {
    logMessage(`Error in getBundledTranslators: ${error}`);
  }
  
  logMessage(`Total translators loaded: ${translators.size}`);
  return translators;
}

/**
 * Install or update a translator
 * @param filename translator filename
 * @param code translator code
 * @returns true if successful
 */
export async function installTranslator(
  filename: string,
  code: string,
): Promise<boolean> {
  try {
    const targetPath = PathUtils.join(
      // @ts-ignore - DataDirectory is available in Zotero
      Zotero.DataDirectory.dir,
      "translators",
      filename,
    );
    
    await IOUtils.writeUTF8(targetPath, code);
    logMessage(`Installed translator: ${filename} to ${targetPath}`);
    return true;
  } catch (error) {
    logMessage(`Failed to install translator ${filename}: ${error}`);
    return false;
  }
}

/**
 * Install or update bundled translators
 * @param force if true, reinstall all translators regardless of version
 * @returns statistics of installation
 */
export async function installBundledTranslators(
  force = false,
): Promise<{
  total: number;
  installed: number;
  updated: number;
  skipped: number;
  failed: number;
}> {
  // @ts-ignore - Schema is available
  await Zotero.Schema.schemaUpdatePromise;
  
  const stats = {
    total: 0,
    installed: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
  };
  
  const bundledTranslators = await getBundledTranslators();
  stats.total = bundledTranslators.size;
  
  if (stats.total === 0) {
    logMessage("No bundled translators found");
    return stats;
  }
  
  logMessage(`Found ${stats.total} bundled translator(s)`);
  
  for (const [filename, code] of bundledTranslators) {
    const bundledMetadata = getTranslatorMetadata(code);
    if (!bundledMetadata) {
      logMessage(`Invalid translator metadata in ${filename}`);
      stats.failed++;
      continue;
    }
    
    const installedLastUpdated = await getInstalledTranslatorLastUpdated(filename);
    
    let shouldInstall = force;
    if (!shouldInstall) {
      if (installedLastUpdated === false) {
        // Translator not installed
        shouldInstall = true;
        logMessage(`Translator ${filename} not installed, will install`);
      } else {
        // Compare versions
        const bundledDate = new Date(bundledMetadata.lastUpdated);
        const installedDate = new Date(installedLastUpdated);
        
        if (bundledDate > installedDate) {
          shouldInstall = true;
          logMessage(
            `Translator ${filename} outdated (installed: ${installedLastUpdated}, bundled: ${bundledMetadata.lastUpdated}), will update`,
          );
        } else {
          logMessage(
            `Translator ${filename} is up to date (${installedLastUpdated}), skipped`,
          );
          stats.skipped++;
        }
      }
    }
    
    if (shouldInstall) {
      const success = await installTranslator(filename, code);
      if (success) {
        if (installedLastUpdated === false) {
          stats.installed++;
        } else {
          stats.updated++;
        }
      } else {
        stats.failed++;
      }
    }
  }
  
  // Reinitialize translators to make changes effective
  if (stats.installed > 0 || stats.updated > 0) {
    // @ts-ignore - Translators.reinit is not in type definitions
    await Zotero.Translators.reinit({ fromSchemaUpdate: false });
    logMessage("Translators reinitialized");
  }
  
  return stats;
}

/**
 * Check if translators need update on first run
 */
export async function checkFirstRunTranslators(): Promise<void> {
  const firstRun = getPref("firstRun") as boolean;
  
  if (firstRun) {
    logMessage("First run detected, installing bundled translators");
    const stats = await installBundledTranslators(true);
    logMessage(`First run translator installation completed:`, stats);
    setPref("firstRun", false);
  }
}

/**
 * Auto-update translators if enabled
 */
export async function autoUpdateTranslators(): Promise<void> {
  const autoUpdate = getPref("autoUpdateTranslators") as boolean;
  
  if (!autoUpdate) {
    logMessage("Auto-update translators is disabled");
    return;
  }
  
  logMessage("Auto-updating translators...");
  const stats = await installBundledTranslators(false);
  
  if (stats.installed > 0 || stats.updated > 0) {
    logMessage(
      `Translators auto-updated: ${stats.installed} installed, ${stats.updated} updated`,
    );
  }
}
