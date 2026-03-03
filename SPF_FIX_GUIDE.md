# Fixing SPF Authentication Failure for sentenly.com

## Problem Summary

Your verification emails from `verification@sentenly.com` are being flagged as spam due to **SPF softfail**. The sending IP address (209.85.220.69 - Amazon SES) isn't authorized in your domain's SPF record.

**Current Status:**
- ❌ SPF: softfail (sending IP not authorized)
- ✅ DKIM: pass
- ✅ DMARC: pass

## Root Cause

Your SPF record is either:
1. Missing completely, OR
2. Incomplete (doesn't include Resend's sending servers)

## Solution: Fix SPF Record in Infomaniak DNS

### Step 1: Check Your Current SPF Record (1 min)

First, let's see what SPF record you currently have:

1. Visit: https://mxtoolbox.com/spf.aspx
2. Enter: `sentenly.com`
3. Click "SPF Record Lookup"

**What you'll likely see:**
- No SPF record found, OR
- An incomplete SPF record without Resend's servers

### Step 2: Access Infomaniak DNS Manager (1 min)

1. Go to: https://manager.infomaniak.com/
2. Log in to your account
3. Click on **"Domains"** in the left sidebar
4. Find and click on **"sentenly.com"**
5. Click on the **"DNS Zone"** or **"DNS Management"** tab

### Step 3: Add/Update SPF Record (3 min)

You need to add a TXT record for SPF. Here's what to do:

#### Option A: If NO SPF Record Exists (Add New)

Click **"Add a Record"** or **"Create New Record"**:

```
Type: TXT
Name: @ (or leave blank, or "sentenly.com")
Value: v=spf1 include:_spf.resend.com ~all
TTL: 3600 (or default)
```

#### Option B: If SPF Record Already Exists (Update)

**⚠️ IMPORTANT:** A domain can only have ONE SPF record!

If you already have an SPF record like:
```
v=spf1 include:_spf.google.com ~all
```

You need to **UPDATE** it (not add a new one):
```
v=spf1 include:_spf.google.com include:_spf.resend.com ~all
```

**To update:**
1. Find the existing TXT record that starts with `v=spf1`
2. Click **"Edit"** or **"Modify"**
3. Add `include:_spf.resend.com` before the `~all` part
4. Save changes

### Step 4: Add Additional DNS Records for Maximum Deliverability (5 min)

While you're in the DNS manager, add these records for best email deliverability:

#### 4.1: DKIM (Authentication)
```
Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.resend.com
TTL: 3600
```

#### 4.2: DMARC (Policy)
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; pct=100; rua=mailto:verification@sentenly.com
TTL: 3600
```

**Note about DMARC policy:**
- `p=quarantine`: Failed emails go to spam (recommended for production)
- `p=none`: No action, just monitor (good for testing)
- `p=reject`: Failed emails are rejected completely (most strict)

Start with `p=quarantine` for a good balance.

#### 4.3: Domain Verification (Resend-specific)
```
Type: TXT
Name: @
Value: [Get this from Resend Dashboard → Domains → sentenly.com]
TTL: 3600
```

**To get the verification code:**
1. Go to: https://resend.com/domains
2. Click on `sentenly.com` (add domain if not already added)
3. Copy the `resend-domain-verification=xxxxx` value
4. Add it as a TXT record in Infomaniak

#### 4.4: MX Record for Bounce Handling (Optional)
```
Type: MX
Name: @
Priority: 10
Value: feedback-smtp.resend.com
TTL: 3600
```

### Step 5: Verify DNS Changes (10-30 min wait)

DNS changes can take time to propagate:
- **Typical time**: 5-30 minutes
- **Maximum time**: 48 hours (rare)

#### Check Propagation:

**Method 1: MXToolbox**
1. Go to: https://mxtoolbox.com/spf.aspx
2. Enter: `sentenly.com`
3. Click "SPF Record Lookup"
4. You should see your new SPF record

**Method 2: Command Line**
```bash
# Windows (PowerShell)
nslookup -type=txt sentenly.com

# You should see something like:
# v=spf1 include:_spf.resend.com ~all
```

**Method 3: Resend Dashboard**
1. Go to: https://resend.com/domains
2. Click on `sentenly.com`
3. Click **"Verify DNS Records"**
4. Status should turn green ✅ when verified

### Step 6: Test Email Delivery (2 min)

Once DNS is propagated:

1. Start your development server
2. Sign up with a new test email address
3. Check the email headers (in Gmail: Open email → ⋮ → "Show original")
4. Look for:
   ```
   Received-SPF: pass (domain sentenly.com designates xxx.xxx.xxx.xxx as permitted sender)
   DKIM-Signature: pass
   DMARC: pass
   ```

## What Each Record Does

### SPF (Sender Policy Framework)
**Purpose**: Lists which servers can send email for your domain

**Your record:** `v=spf1 include:_spf.resend.com ~all`
- `v=spf1` - Version indicator
- `include:_spf.resend.com` - Authorizes Resend's sending servers (includes Amazon SES IPs)
- `~all` - Soft fail for other servers (mark as spam but don't reject)

**Why this fixes the issue:**
Resend uses Amazon SES for sending. When you `include:_spf.resend.com`, you're actually including all the Amazon SES IP addresses that Resend uses, including `209.85.220.69`.

### DKIM (DomainKeys Identified Mail)
**Purpose**: Cryptographic signature proving email wasn't tampered with

**Your record:** CNAME pointing to Resend's keys
- Resend manages the private keys
- Your CNAME points to their public key
- Each email gets digitally signed

### DMARC (Domain-based Message Authentication)
**Purpose**: Tells receiving servers what to do if SPF/DKIM fail

**Your record:** Policy for failed authentication
- `p=quarantine` - Send to spam if both SPF and DKIM fail
- `rua=mailto:...` - Send reports to this email

## Resend.com Configuration

Good news: **Resend handles most of the sending infrastructure automatically!**

### What Resend Provides:
✅ Amazon SES infrastructure (IP reputation)
✅ DKIM signing (automatic)
✅ Bounce/complaint handling
✅ Delivery tracking
✅ IP warming (automatic)

### What YOU Need to Configure:
1. ✅ DNS records (SPF, DKIM, DMARC) - covered above
2. ✅ Environment variables (already set in your .env.local)
3. ✅ Domain verification in Resend dashboard

### Verify Resend Domain Setup:

1. Go to: https://resend.com/domains
2. You should see `sentenly.com` with status:
   - ✅ Domain verified
   - ✅ SPF verified
   - ✅ DKIM verified
   - ✅ DMARC verified

If any are red ❌, click on the domain to see which DNS records are missing.

## Quick Reference: Complete DNS Settings

Here's the complete set of DNS records you need in Infomaniak:

| Type | Name | Value | Priority | TTL |
|------|------|-------|----------|-----|
| TXT | @ | `v=spf1 include:_spf.resend.com ~all` | - | 3600 |
| TXT | _dmarc | `v=DMARC1; p=quarantine; pct=100; rua=mailto:verification@sentenly.com` | - | 3600 |
| TXT | @ | `resend-domain-verification=xxxxx` (from Resend dashboard) | - | 3600 |
| CNAME | resend._domainkey | `resend._domainkey.resend.com` | - | 3600 |
| MX | @ | `feedback-smtp.resend.com` | 10 | 3600 |

## Troubleshooting

### Issue: "SPF record not found after 30 minutes"

**Solutions:**
1. Check Infomaniak DNS manager - record actually saved?
2. Verify the record name is `@` or blank (not "sentenly.com")
3. Try lower TTL (300 instead of 3600)
4. Clear your DNS cache:
   ```bash
   # Windows
   ipconfig /flushdns
   ```

### Issue: "Multiple SPF records found"

**Problem**: You have more than one TXT record starting with `v=spf1`

**Solution**: Merge them into ONE record:
```
# Wrong (2 records):
v=spf1 include:_spf.google.com ~all
v=spf1 include:_spf.resend.com ~all

# Right (1 record):
v=spf1 include:_spf.google.com include:_spf.resend.com ~all
```

### Issue: "Emails still going to spam"

**Possible causes:**
1. DNS not propagated yet (wait 30 min - 2 hours)
2. Email content triggers spam filters (too many links, urgent language)
3. Domain is new (needs reputation building)
4. Recipients' servers have strict policies

**Solutions:**
1. Wait for DNS propagation
2. Improve email content (less urgent language, clear sender)
3. Send to smaller batches initially
4. Check email headers for specific spam reasons

### Issue: "Resend domain verification failing"

**Solutions:**
1. Make sure you added the verification TXT record
2. Wait 15-30 minutes for DNS propagation
3. In Resend dashboard, click "Verify DNS Records" manually
4. Check for typos in DNS values

## Expected Results After Fix

Once SPF is fixed, your email headers will show:

```
Authentication-Results: spf=pass smtp.mailfrom=send.sentenly.com
Authentication-Results: dkim=pass header.d=sentenly.com
Authentication-Results: dmarc=pass (policy=quarantine)
```

**Before:**
- ❌ SPF: softfail → ⚠️ Spam folder
- ✅ DKIM: pass
- ✅ DMARC: pass

**After:**
- ✅ SPF: pass → ✅ Inbox
- ✅ DKIM: pass
- ✅ DMARC: pass

## Timeline

- **DNS setup**: 5-10 minutes
- **DNS propagation**: 15-30 minutes (up to 48 hours)
- **Testing**: 2 minutes
- **Total**: ~30 minutes to 2 hours

## Need Help?

If you're still having issues after following this guide:

1. **Check DNS records:**
   - https://mxtoolbox.com/SuperTool.aspx?action=spf%3asentenly.com

2. **Check email headers:**
   - Send a test email
   - Open in Gmail → ⋮ → "Show original"
   - Look for Authentication-Results section

3. **Resend Support:**
   - Dashboard: https://resend.com/domains
   - Docs: https://resend.com/docs/dashboard/domains/introduction
   - Support: support@resend.com

## Additional Resources

- **SPF Record Checker**: https://dmarcian.com/spf-survey/
- **DKIM Checker**: https://dmarcian.com/dkim-inspector/
- **DMARC Checker**: https://dmarcian.com/dmarc-inspector/
- **Email Header Analyzer**: https://mxtoolbox.com/EmailHeaders.aspx
- **Resend Documentation**: https://resend.com/docs

---

**Next Steps:**
1. ✅ Update SPF record in Infomaniak (Step 3)
2. ✅ Add DKIM and DMARC records (Step 4)
3. ⏱️ Wait 30 minutes for DNS propagation (Step 5)
4. ✅ Verify in Resend dashboard (Step 5)
5. ✅ Test email delivery (Step 6)
