const fs = require('fs');

function fixUniversalContentController() {
  const p = 'src/modules/content/universal-content.controller.ts';
  let s = fs.readFileSync(p, 'utf8');
  s = s.replace(/getAllContent\(/g, 'async getAllContent(');
  s = s.replace(/const result = this\.contentService\.searchContent/g, 'const result = await this.contentService.searchContent');
  s = s.replace(/getStats\(\)/g, 'async getStats()');
  s = s.replace(/const stats = this\.contentService\.getContentStats/g, 'const stats = await this.contentService.getContentStats');
  s = s.replace(/getRecentActivity\(/g, 'async getRecentActivity(');
  s = s.replace(/const items = this\.contentService\.getRecentActivity/g, 'const items = await this.contentService.getRecentActivity');
  s = s.replace(/getContentTypes\(\)/g, 'async getContentTypes()');
  s = s.replace(/const types = this\.contentService\.getContentTypes/g, 'const types = await this.contentService.getContentTypes');
  s = s.replace(/registerContentType\(/g, 'async registerContentType(');
  s = s.replace(/const created = this\.contentService\.registerContentType/g, 'const created = await this.contentService.registerContentType');
  s = s.replace(/getCategories\(\)/g, 'async getCategories()');
  s = s.replace(/const categories = this\.contentService\.getAllCategories/g, 'const categories = await this.contentService.getAllCategories');
  s = s.replace(/getCategoryTree\(\)/g, 'async getCategoryTree()');
  s = s.replace(/const tree = this\.contentService\.getCategoryTree/g, 'const tree = await this.contentService.getCategoryTree');
  s = s.replace(/createCategory\(/g, 'async createCategory(');
  s = s.replace(/const created = this\.contentService\.createCategory/g, 'const created = await this.contentService.createCategory');
  s = s.replace(/updateCategory\(/g, 'async updateCategory(');
  s = s.replace(/const updated = this\.contentService\.updateCategory/g, 'const updated = await this.contentService.updateCategory');
  s = s.replace(/deleteCategory\(/g, 'async deleteCategory(');
  s = s.replace(/const deleted = this\.contentService\.deleteCategory/g, 'const deleted = await this.contentService.deleteCategory');
  s = s.replace(/mergeCategories\(/g, 'async mergeCategories(');
  s = s.replace(/const merged = this\.contentService\.mergeCategories/g, 'const merged = await this.contentService.mergeCategories');
  s = s.replace(/getTags\(\)/g, 'async getTags()');
  s = s.replace(/const tags = this\.contentService\.getAllTags/g, 'const tags = await this.contentService.getAllTags');
  
  s = s.replace(/getRecycleBin\(\)/g, 'async getRecycleBin()');
  s = s.replace(/const result = this\.contentService\.searchContent\(\{ status: 'RECYCLE_BIN', includeDeleted: true, limit: 100 \}\);/g, 'const result = await this.contentService.searchContent({ status: "RECYCLE_BIN", includeDeleted: true, limit: 100 });');
  s = s.replace(/this\.contentService\.getAllContent\(\{ includeDeleted: true \}\)\s*\.items\?/g, '(await this.contentService.getAllContent({ includeDeleted: true })).items?');

  s = s.replace(/exportContent\(/g, 'async exportContent(');
  s = s.replace(/const data = this\.contentService\.exportContent/g, 'const data = await this.contentService.exportContent');
  s = s.replace(/importContent\(/g, 'async importContent(');
  s = s.replace(/const result = this\.contentService\.importContent/g, 'const result = await this.contentService.importContent');
  s = s.replace(/processScheduled\(\)/g, 'async processScheduled()');
  s = s.replace(/const count = this\.contentService\.processScheduledPublishing/g, 'const count = await this.contentService.processScheduledPublishing');

  s = s.replace(/getContentById\(/g, 'async getContentById(');
  s = s.replace(/const item = this\.contentService\.getContentById/g, 'const item = await this.contentService.getContentById');
  s = s.replace(/createContent\(/g, 'async createContent(');
  s = s.replace(/const created = this\.contentService\.createContent/g, 'const created = await this.contentService.createContent');
  s = s.replace(/updateContent\(/g, 'async updateContent(');
  s = s.replace(/const updated = this\.contentService\.updateContent/g, 'const updated = await this.contentService.updateContent');
  s = s.replace(/deleteContent\(/g, 'async deleteContent(');
  s = s.replace(/const deleted = this\.contentService\.deleteContent/g, 'const deleted = await this.contentService.deleteContent');
  s = s.replace(/restoreContent\(/g, 'async restoreContent(');
  s = s.replace(/const restored = this\.contentService\.restoreContent/g, 'const restored = await this.contentService.restoreContent');
  s = s.replace(/permanentDeleteContent\(/g, 'async permanentDeleteContent(');
  s = s.replace(/const purged = this\.contentService\.permanentDeleteContent/g, 'const purged = await this.contentService.permanentDeleteContent');
  
  s = s.replace(/publishContent\(/g, 'async publishContent(');
  s = s.replace(/const updated = this\.contentService\.publishContent/g, 'const updated = await this.contentService.publishContent');
  s = s.replace(/unpublishContent\(/g, 'async unpublishContent(');
  s = s.replace(/const updated = this\.contentService\.unpublishContent/g, 'const updated = await this.contentService.unpublishContent');
  s = s.replace(/archiveContent\(/g, 'async archiveContent(');
  s = s.replace(/const updated = this\.contentService\.archiveContent/g, 'const updated = await this.contentService.archiveContent');
  s = s.replace(/duplicateContent\(/g, 'async duplicateContent(');
  s = s.replace(/const copy = this\.contentService\.duplicateContent/g, 'const copy = await this.contentService.duplicateContent');
  s = s.replace(/scheduleContent\(/g, 'async scheduleContent(');
  s = s.replace(/const updated = this\.contentService\.scheduleContent/g, 'const updated = await this.contentService.scheduleContent');
  
  s = s.replace(/getRevisions\(/g, 'async getRevisions(');
  s = s.replace(/const revisions = this\.contentService\.getRevisions/g, 'const revisions = await this.contentService.getRevisions');
  s = s.replace(/restoreRevision\(/g, 'async restoreRevision(');
  s = s.replace(/const restored = this\.contentService\.restoreRevision/g, 'const restored = await this.contentService.restoreRevision');
  
  fs.writeFileSync(p, s);
}

function fixEditorService() {
  const p = 'src/modules/editor/editor.service.ts';
  let s = fs.readFileSync(p, 'utf8');
  s = s.replace(/\(rb\.block\.json_config as Record<string, any>\)/g, `(typeof rb.block.json_config === 'string' ? JSON.parse(rb.block.json_config) : rb.block.json_config)`);
  s = s.replace(/\(dbPage\.seo_metadata as Record<string, any>\)/g, `(typeof dbPage.seo_metadata === 'string' ? JSON.parse(dbPage.seo_metadata) : dbPage.seo_metadata)`);
  fs.writeFileSync(p, s);
}

function fixPublicationsService() {
  const p = 'src/modules/publications/publications.service.ts';
  let s = fs.readFileSync(p, 'utf8');
  s = s.replace(/const res = this\.universalService\.getAllContent/g, 'const res = await this.universalService.getAllContent');
  s = s.replace(/this\.universalService\.softDeleteContent/g, 'this.universalService.deleteContent');
  fs.writeFileSync(p, s);
}

function fixRendererService() {
  const p = 'src/modules/renderer/renderer.service.ts';
  let s = fs.readFileSync(p, 'utf8');
  s = s.replace(/const repoData = this\.universalContentService\.getAllContent/g, 'const repoData = await this.universalContentService.getAllContent');
  s = s.replace(/const repositoryData = this\.universalContentService\.getAllContent/g, 'const repositoryData = await this.universalContentService.getAllContent');
  fs.writeFileSync(p, s);
}

fixUniversalContentController();
fixEditorService();
fixPublicationsService();
fixRendererService();
console.log('Fixed typings.');
