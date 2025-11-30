---
name: Security Report
about: Weekly automated security audit report
title: '🔒 Security Audit Report'
labels: 'security, automated'
assignees: ''
---

## 🔒 Weekly Security Audit Report

**Date:** {{ date | date('YYYY-MM-DD') }}
**Run:** #{{ env.GITHUB_RUN_NUMBER }}

---

## Summary

| Tool | Status | Findings |
|------|--------|----------|
| OWASP ZAP Baseline | ⏳ Check artifacts | - |
| OWASP ZAP API Scan | ⏳ Check artifacts | - |
| Nuclei | ⏳ Check artifacts | - |
| Dependency Audit | ⏳ Check artifacts | - |

---

## Action Items

### 🔴 Critical (Fix immediately)

- [ ] Review any SQL Injection findings
- [ ] Review any XSS findings
- [ ] Review any authentication bypass findings

### 🟠 High (Fix this sprint)

- [ ] Review authorization issues
- [ ] Review sensitive data exposure
- [ ] Review security misconfigurations

### 🟡 Medium (Plan fix)

- [ ] Missing security headers
- [ ] Outdated dependencies
- [ ] Information disclosure

---

## Reports

Download the detailed reports from the workflow artifacts:

1. [OWASP ZAP Reports](../actions/runs/{{ env.GITHUB_RUN_ID }})
2. [Nuclei Results](../actions/runs/{{ env.GITHUB_RUN_ID }})
3. [Dependency Audit](../actions/runs/{{ env.GITHUB_RUN_ID }})

---

## Next Steps

1. Review all findings in the artifacts
2. Triage and prioritize issues
3. Create individual issues for each finding that needs fixing
4. Update security documentation if needed
5. Schedule fixes in upcoming sprints

---

## OWASP API Security Top 10 Checklist

- [ ] **API1:2023** - Broken Object Level Authorization (BOLA)
- [ ] **API2:2023** - Broken Authentication
- [ ] **API3:2023** - Broken Object Property Level Authorization
- [ ] **API4:2023** - Unrestricted Resource Consumption
- [ ] **API5:2023** - Broken Function Level Authorization
- [ ] **API6:2023** - Unrestricted Access to Sensitive Business Flows
- [ ] **API7:2023** - Server Side Request Forgery (SSRF)
- [ ] **API8:2023** - Security Misconfiguration
- [ ] **API9:2023** - Improper Inventory Management
- [ ] **API10:2023** - Unsafe Consumption of APIs

---

/cc @security-team
