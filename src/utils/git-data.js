import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoDir = path.join(__dirname, '../../.cache/joblist-data');

// Build-time cache - download once at build start
let dataCache = null;
let isInitializing = false;

const TIMEOUT_MS = 40000; // 40 second timeout as requested

export async function initializeDataCache() {
  if (dataCache) return dataCache;
  if (isInitializing) {
    // Wait for initialization to complete
    while (isInitializing && !dataCache) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return dataCache;
  }

  isInitializing = true;
  console.log('🔄 Initializing joblist data repository...');

  try {
    // Ensure cache directory exists
    if (!fs.existsSync(path.dirname(repoDir))) {
      fs.mkdirSync(path.dirname(repoDir), { recursive: true });
    }

    // Clone or update repository
    if (!fs.existsSync(repoDir)) {
      console.log('📡 Cloning joblist data repository...');
      await Promise.race([
        git.clone({
          fs,
          http,
          dir: repoDir,
          url: 'https://github.com/joblisttoday/data.git',
          singleBranch: true,
          depth: 1,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Clone timed out')), TIMEOUT_MS)
        )
      ]);
    } else {
      console.log('🔄 Updating existing repository...');
      try {
        await Promise.race([
          git.pull({
            fs,
            http,
            dir: repoDir,
            ref: 'main',
            singleBranch: true,
            author: { name: 'joblist-build', email: 'build@joblist.today' }
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Pull timed out')), TIMEOUT_MS / 2)
          )
        ]);
      } catch (error) {
        console.warn('Pull failed, using existing data:', error.message);
      }
    }

    // Load all company data into memory
    const companiesDir = path.join(repoDir, 'companies');
    const companies = new Map();
    const companiesList = [];

    if (fs.existsSync(companiesDir)) {
      const entries = fs.readdirSync(companiesDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const companyId = entry.name;
          companiesList.push(companyId);
          
          const indexPath = path.join(companiesDir, companyId, 'index.json');
          if (fs.existsSync(indexPath)) {
            try {
              const data = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
              companies.set(companyId, data);
            } catch (error) {
              console.warn(`⚠️ Failed to parse ${companyId}/index.json:`, error.message);
            }
          }
        }
      }
    }

    dataCache = { companies, companiesList };
    console.log(`✅ Loaded ${companiesList.length} companies into cache`);
    
    isInitializing = false;
    return dataCache;

  } catch (error) {
    console.error('❌ Failed to initialize data cache:', error);
    isInitializing = false;
    
    // Return empty cache as fallback
    dataCache = { companies: new Map(), companiesList: [] };
    return dataCache;
  }
}

// Fast access functions - data is already loaded
export async function getCompanyList() {
  const cache = await initializeDataCache();
  return cache.companiesList;
}

export async function getCompanyData(companyId) {
  const cache = await initializeDataCache();
  return cache.companies.get(companyId) || null;
}

export async function getAllCompaniesData() {
  const cache = await initializeDataCache();
  return cache.companies;
}