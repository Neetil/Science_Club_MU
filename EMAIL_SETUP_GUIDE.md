# 📧 Email Configuration Guide - Step by Step

This guide will help you set up email sending for the newsletter feature using Gmail SMTP.

## 🎯 Overview

To send newsletters to subscribers, you need to configure SMTP (Simple Mail Transfer Protocol) settings. We'll use Gmail as an example, but you can use any email provider that supports SMTP.

---

## 📝 Step-by-Step Instructions

### **Step 1: Enable 2-Step Verification on Gmail**

1. **Go to your Google Account**
   - Visit: https://myaccount.google.com/
   - Sign in with the Gmail account you want to use for sending newsletters

2. **Navigate to Security Settings**
   - Click on **"Security"** in the left sidebar
   - Scroll down to find **"2-Step Verification"**

3. **Enable 2-Step Verification**
   - Click **"2-Step Verification"**
   - Follow the prompts to set it up
   - You'll need to verify your phone number
   - **Important**: This is required to generate an App Password later

---

### **Step 2: Generate an App Password**

1. **Go to App Passwords**
   - Still in Security settings, scroll down to **"App passwords"**
   - Or visit directly: https://myaccount.google.com/apppasswords
   - You might need to sign in again

2. **Create a New App Password**
   - Click **"Select app"** dropdown → Choose **"Mail"**
   - Click **"Select device"** dropdown → Choose **"Other (Custom name)"**
   - Type: `Science Club Website` (or any name you prefer)
   - Click **"Generate"**

3. **Copy the App Password**
   - Google will show you a **16-character password** (like: `abcd efgh ijkl mnop`)
   - **Copy this password immediately** - you won't be able to see it again!
   - Remove all spaces: `abcdefghijklmnop`
   - Save it somewhere secure (you'll need it in Step 4)

---

### **Step 3: Find Your .env File**

1. **Locate your project folder**
   - Navigate to: `D:\Club Website\Science-Club`

2. **Check if .env file exists**
   - Look for a file named `.env` in the root folder
   - If it doesn't exist, create a new file named `.env` (no extension)

3. **Open the .env file**
   - Use any text editor (Notepad, VS Code, etc.)
   - **Important**: Make sure it's named exactly `.env` (not `.env.txt`)

---

### **Step 4: Add Email Configuration to .env**

1. **Open your `.env` file** in a text editor

2. **Add these lines** (replace with your actual values):

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=abcdefghijklmnop
SMTP_FROM=your-email@gmail.com
```

3. **Replace the values:**
   - `SMTP_USER`: Your Gmail address (e.g., `scienceclub@gmail.com`)
   - `SMTP_PASSWORD`: The 16-character App Password you generated in Step 2 (no spaces)
   - `SMTP_FROM`: Usually the same as `SMTP_USER` (the email address that will appear as sender)

**Example:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=scienceclub@gmail.com
SMTP_PASSWORD=abcdefghijklmnop
SMTP_FROM=scienceclub@gmail.com
```

4. **Save the file**

---

### **Step 5: Restart Your Development Server**

1. **Stop your current server**
   - If your dev server is running, press `Ctrl + C` in the terminal

2. **Start it again**
   ```bash
   npm run dev
   ```
   - Environment variables are loaded when the server starts
   - Changes to `.env` require a restart

---

### **Step 6: Test Email Sending**

1. **Go to Admin Panel**
   - Navigate to: `http://localhost:3000/admin/subscribers`
   - Log in with your admin credentials

2. **Open Email Composer**
   - Click the **"Send Email"** button
   - The email composer form will appear

3. **Compose a Test Email**
   - **Subject**: `Test Email`
   - **Message**: `This is a test email from the Science Club website.`
   - Select at least one subscriber (or use "Send to All")

4. **Send the Email**
   - Click **"Send to Selected"** or **"Send to All"**
   - Wait for the success/error message

5. **Check Results**
   - ✅ **Success**: You'll see a green success message
   - ❌ **Error**: Check the error message for troubleshooting

---

## 🔧 Troubleshooting

### **Problem: "Email configuration is missing"**
- **Solution**: Make sure all SMTP variables are in your `.env` file
- Restart your dev server after adding them

### **Problem: "Invalid login credentials"**
- **Solution**: 
  - Double-check your `SMTP_USER` (must be your full Gmail address)
  - Make sure `SMTP_PASSWORD` is the App Password (16 characters, no spaces)
  - Verify 2-Step Verification is enabled

### **Problem: "Connection timeout" or "Connection refused"**
- **Solution**:
  - Check your internet connection
  - Verify `SMTP_HOST=smtp.gmail.com` and `SMTP_PORT=587`
  - Try port `465` instead (change `SMTP_PORT=465`)

### **Problem: "Too many login attempts"**
- **Solution**: 
  - Wait 10-15 minutes
  - Make sure you're using an App Password, not your regular Gmail password

### **Problem: Emails going to Spam**
- **Solution**:
  - This is normal for new email senders
  - Ask recipients to check their spam folder
  - Consider using a professional email service (SendGrid, Mailgun) for production

---

## 📧 Using Other Email Providers

### **Outlook/Hotmail**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
SMTP_FROM=your-email@outlook.com
```

### **Yahoo Mail**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@yahoo.com
```

### **Custom SMTP Server**
```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@yourdomain.com
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` to Git**
   - The `.env` file should already be in `.gitignore`
   - Never share your App Password publicly

2. **Use App Passwords**
   - Always use App Passwords, never your main Gmail password
   - You can revoke App Passwords anytime from Google Account settings

3. **For Production**
   - Consider using professional email services (SendGrid, Mailgun, AWS SES)
   - They have better deliverability and higher sending limits

---

## ✅ Checklist

Before sending newsletters, make sure:

- [ ] 2-Step Verification is enabled on Gmail
- [ ] App Password is generated and copied
- [ ] `.env` file has all SMTP variables
- [ ] Development server is restarted
- [ ] Test email sent successfully
- [ ] Received test email in inbox (check spam too)

---

## 🆘 Need Help?

If you're still having issues:

1. **Check the error message** in the admin panel - it usually tells you what's wrong
2. **Verify your `.env` file** - make sure there are no typos
3. **Test with a different email provider** - Gmail might have restrictions
4. **Check server logs** - look for detailed error messages in your terminal

---

**That's it!** You're now ready to send newsletters to your subscribers. 🎉

