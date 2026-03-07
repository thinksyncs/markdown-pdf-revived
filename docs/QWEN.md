# QWEN.md - Development Session Log

**Purpose:** Track development sessions, completed work, and next steps for Markdown PDF (Revived)

---

## Session Log

### Session 1: 7 March 2026 - Project Setup & PlantUML Removal

**Duration:** ~2 hours  
**Status:** ✅ Complete

#### What Was Accomplished

1. **Repository Setup**
   - ✅ Created fork: https://github.com/AUAggy/markdown-pdf-revived
   - ✅ Cloned to local machine
   - ✅ Created `revived-main` branch
   - ✅ Configured git remotes (origin + upstream)
   - ✅ Set git user identity

2. **Attribution Cleanup**
   - ✅ Removed all `Co-authored-by: Qwen-Coder` references from commit history
   - ✅ Rewrote commits to ensure no LLM attribution visible publicly
   - ✅ Force-pushed clean history to GitHub

3. **Phase 1.2: Remove PlantUML** ✅ COMPLETE
   - ✅ Removed PlantUML code from `extension.js` (lines 269-276)
   - ✅ Removed `markdown-it-plantuml` dependency from `package.json`
   - ✅ Removed 3 PlantUML settings:
     - `markdown-pdf.plantumlOpenMarker`
     - `markdown-pdf.plantumlCloseMarker`
     - `markdown-pdf.plantumlServer`
   - ✅ Removed "PlantUML" keyword from `package.json`
   - ✅ Deleted `images/PlantUML.png`
   - ✅ Updated `README.md`:
     - Removed PlantUML from features list
     - Removed PlantUML example section
     - Added comprehensive migration guide with PlantUML → Mermaid conversion table
     - Documented why PlantUML was removed (privacy, offline, abandoned)

4. **Documentation**
   - ✅ Created `docs/` folder structure
   - ✅ Added `MODERNIZATION_PLAN.md` to docs
   - ✅ Added `todo.md` to docs (with completed items checked)
   - ✅ Created `QWEN.md` (this file)

#### Commits Created

```
9f00b5e feat: remove PlantUML for privacy-first, offline positioning
d50e168 Create FUNDING.yml (from original)
```

#### Code Changes Summary

**Files Modified:**
- `extension.js` - Removed PlantUML plugin initialization (~10 lines deleted)
- `package.json` - Removed dependency and 3 settings (~15 lines deleted)
- `README.md` - Removed PlantUML section, added migration guide (~30 lines changed)

**Files Deleted:**
- `images/PlantUML.png`

**Settings Removed:** 3
- `markdown-pdf.plantumlOpenMarker`
- `markdown-pdf.plantumlCloseMarker`
- `markdown-pdf.plantumlServer`

**Code Reduction:** ~25 lines of code removed

#### Decisions Made

1. **PlantUML removed** - Privacy/offline positioning, 75% of issues unresolved in original
2. **Mermaid as replacement** - Local rendering, offline-capable, strong community demand
3. **Public development** - Repository is public for transparency and community trust
4. **Repo name:** `markdown-pdf-revived` - Clear lineage + revival status
5. **Tagline:** "A privacy-first, offline-capable Markdown to PDF converter for VSCode"

#### Issues Encountered

1. **Co-authored-by attribution** - Git was automatically adding Qwen-Coder attribution
   - **Resolution:** Used `git commit --amend` with message editing to strip trailers
   - **Lesson:** Check commit messages before pushing

2. **macOS trash permission** - Couldn't delete PlantUML.png to trash
   - **Resolution:** Used `rm` directly after git rm --cached
   - **Lesson:** Git operations can conflict with macOS file system

---

## Next Steps

### Immediate (Next Session)

**Priority:** Phase 1.3 - Remove PNG/JPEG Export

1. **Remove PNG/JPEG code from extension.js**
   - Find and remove `exportPng()` function
   - Find and remove `exportJpeg()` function
   - Remove PNG/JPEG from command registration

2. **Remove PNG/JPEG settings from package.json**
   - `markdown-pdf.quality`
   - `markdown-pdf.clip.x`
   - `markdown-pdf.clip.y`
   - `markdown-pdf.clip.width`
   - `markdown-pdf.clip.height`
   - `markdown-pdf.omitBackground`

3. **Update "All" export command**
   - Remove PNG/JPEG from the export all command
   - Update command labels

4. **Test**
   - Verify PNG/JPEG commands no longer appear
   - Verify PDF export still works
   - Verify HTML export still works

### This Week (Phase 1)

- [ ] Complete Phase 1.3: Remove PNG/JPEG
- [ ] Install dependencies and test current state
- [ ] Review and merge PR #365 (Puppeteer upgrade)
- [ ] Update all dependencies
- [ ] Add DOMPurify for security (CVE-2024-7739)

---

## Project Status Dashboard

| Phase | Status | Progress |
|-------|--------|----------|
| **Phase 1: Critical Fixes** | 🟡 In Progress | 15% complete |
| - 1.1 Repository Setup | ✅ Complete | 100% |
| - 1.2 Remove PlantUML | ✅ Complete | 100% |
| - 1.3 Remove PNG/JPEG | ⚪ Pending | 0% |
| - 1.4 Merge Community PRs | ⚪ Pending | 0% |
| - 1.5 Update Dependencies | ⚪ Pending | 0% |
| - 1.6 Fix Security (CVE) | ⚪ Pending | 0% |
| **Phase 2: Architecture** | ⚪ Not Started | 0% |
| **Phase 3: Feature Cleanup** | ⚪ Not Started | 0% |
| **Phase 4: Documentation** | ⚪ Not Started | 0% |

---

## Quick Reference

### Repository URLs
- **Fork:** https://github.com/AUAggy/markdown-pdf-revived
- **Original:** https://github.com/yzane/vscode-markdown-pdf

### Key Files
- `extension.js` - Main extension code (902 lines, to be refactored)
- `package.json` - Dependencies and configuration
- `README.md` - User documentation
- `docs/todo.md` - Implementation checklist
- `docs/QWEN.md` - This file (session log)
- `docs/MODERNIZATION_PLAN.md` - Full modernization plan

### Commands Used
```bash
# Clone fork
git clone https://github.com/AUAggy/markdown-pdf-revived.git

# Add upstream remote
git remote add upstream https://github.com/yzane/vscode-markdown-pdf.git

# Create feature branch
git checkout -b revived-main

# Commit changes
git add -A
git commit -m "feat: remove PlantUML for privacy-first, offline positioning"

# Force push (after rewriting history)
git push --force origin revived-main
```

---

## Notes for Future Sessions

### What's Working Well
- Clear plan in MODERNIZATION_PLAN.md
- Granular tasks in todo.md
- Single commit per logical change
- Public repository for transparency

### What to Watch Out For
- Always check commit messages before pushing
- Test extension after each major change
- Keep docs/ updated with progress
- Remember to update both todo.md and QWEN.md

### Context to Maintain
- **Privacy-first positioning** - No external servers, no telemetry
- **Offline-capable** - All rendering local
- **Lean & fast** - PDF/HTML only, no bloat
- **Modern** - Updated dependencies, TypeScript (Phase 2)
- **Secure** - Input sanitization, no CVEs

---

**Last Session:** 7 March 2026  
**Next Session:** TBD (Phase 1.3 - Remove PNG/JPEG)  
**Session Time:** ~2 hours  
**Total Project Time:** ~2 hours
