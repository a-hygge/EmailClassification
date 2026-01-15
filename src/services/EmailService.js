class Email {
    constructor(recipients, title, content) {
        this.recipients = recipients;
        this.title = title;
        this.content = content;
        this.toEmails = this.parseRecipients();
    }

    parseRecipients() {
        return [...new Set(
            this.recipients
            .split(',')
            .map(e => e.trim())
            .filter(e => e)
        )];
    }

    buildMailOptions() {
        return {
            from: process.env.GMAIL_USER,
            to: this.toEmails.join(", "),
            subject: this.title,
            text: this.content
        };
    }
}

export default Email;