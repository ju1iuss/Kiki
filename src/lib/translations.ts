// Translation strings

import { Language } from './language';

export type TranslationKey = 
  | 'hero.title'
  | 'hero.subtitle'
  | 'hero.cta'
  | 'hero.guarantee'
  | 'hero.dashboardAlt'
  | 'header.features'
  | 'header.solution'
  | 'header.pricing'
  | 'header.about'
  | 'header.apply'
  | 'features.title'
  | 'features.createAccounts'
  | 'features.createAccountsDesc'
  | 'features.warmUp'
  | 'features.warmUpDesc'
  | 'features.postContent'
  | 'features.postContentDesc'
  | 'features.engage'
  | 'features.engageDesc'
  | 'features.realDevices'
  | 'features.realDevicesDesc'
  | 'features.analytics'
  | 'features.analyticsDesc'
  | 'features.footer'
  | 'content.title'
  | 'content.subtitle'
  | 'content.bulkUpload'
  | 'content.bulkUploadDesc'
  | 'content.aiGeneration'
  | 'content.aiGenerationDesc'
  | 'content.lightningFast'
  | 'content.lightningFastDesc'
  | 'content.smartDistribution'
  | 'content.smartDistributionDesc'
  | 'comparator.title'
  | 'comparator.subtitle'
  | 'comparator.diy'
  | 'comparator.freelancer'
  | 'comparator.tasy'
  | 'comparator.bestChoice'
  | 'comparator.accountCreation'
  | 'comparator.automatedPosting'
  | 'comparator.humanLikeEngagement'
  | 'comparator.realDeviceDeployment'
  | 'comparator.scale'
  | 'comparator.performanceAnalytics'
  | 'comparator.monthlyCost'
  | 'comparator.timeRequired'
  | 'comparator.basic'
  | 'comparator.manualReports'
  | 'comparator.realTimeDashboard'
  | 'comparator.yourTime'
  | 'comparator.perAccount'
  | 'comparator.hoursPerWeek'
  | 'comparator.weeklyManagement'
  | 'comparator.zeroHours'
  | 'pricing.title'
  | 'pricing.perAccount'
  | 'pricing.scale'
  | 'pricing.price'
  | 'pricing.perMonth'
  | 'pricing.cta'
  | 'pricing.description'
  | 'pricing.feature1'
  | 'pricing.feature2'
  | 'pricing.feature3'
  | 'pricing.feature4'
  | 'pricing.feature5'
  | 'pricing.feature6'
  | 'pricing.footer'
  | 'faq.title'
  | 'faq.subtitle'
  | 'faq.contact'
  | 'faq.q1'
  | 'faq.a1'
  | 'faq.q2'
  | 'faq.a2'
  | 'faq.q3'
  | 'faq.a3'
  | 'faq.q4'
  | 'faq.a4'
  | 'faq.q5'
  | 'faq.a5'
  | 'footer.copyright'
  | 'footer.privacy'
  | 'footer.terms'
  | 'footer.contact'
  | 'apply.title'
  | 'apply.userType.question'
  | 'apply.userType.brandOwner'
  | 'apply.userType.agency'
  | 'apply.userType.affiliate'
  | 'apply.userType.founder'
  | 'apply.userType.other'
  | 'apply.userType.specify'
  | 'apply.accounts.question'
  | 'apply.accounts.description'
  | 'apply.accounts.label'
  | 'apply.contact.name'
  | 'apply.contact.email'
  | 'apply.contact.company'
  | 'apply.contact.companyOptional'
  | 'apply.contact.next'
  | 'apply.contact.checking'
  | 'apply.capacity.title'
  | 'apply.capacity.count'
  | 'apply.capacity.message'
  | 'apply.priority.title'
  | 'apply.priority.price'
  | 'apply.priority.originalPrice'
  | 'apply.priority.guarantee'
  | 'apply.priority.skip'
  | 'apply.priority.account'
  | 'apply.priority.preorder'
  | 'apply.priority.processing'
  | 'apply.success.title'
  | 'apply.success.message'
  | 'apply.continue'
  | 'apply.rolledOut';

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    'hero.title': 'We Build, Warm-Up, and Grow Accounts That Print Views.',
    'hero.subtitle': 'You upload or generate content, we distribute it like 10 social media managers in one with human-like engagement patterns.',
    'hero.cta': 'Want Access? Apply Now',
    'hero.guarantee': 'Anti-Shadow-Ban Guarantee',
    'hero.dashboardAlt': 'Tasy Analytics Dashboard showing 15.5M views and 248K followers',
    'header.features': 'Features',
    'header.solution': 'Solution',
    'header.pricing': 'Pricing',
    'header.about': 'About',
    'header.apply': 'Apply Now',
    'features.title': 'Everything Runs on Autopilot',
    'features.createAccounts': 'We Create The Accounts',
    'features.createAccountsDesc': 'Pre-verified, aged, niche-specific accounts ready to deploy in 24h.',
    'features.warmUp': 'We Warm Them Up',
    'features.warmUpDesc': 'Weeks of human-like activity. Trusted by platform algorithms.',
    'features.postContent': 'We Post Your Content',
    'features.postContentDesc': 'Smart scheduling across all accounts. Platform-optimized formats.',
    'features.engage': 'We Engage For You',
    'features.engageDesc': 'Automated liking, commenting, sharing. Behavior patterns that look 100% human.',
    'features.realDevices': 'Real Device Deployment',
    'features.realDevicesDesc': 'Physical phones, not cloud VMs. Real IPs, real locations.',
    'features.analytics': 'Performance Analytics',
    'features.analyticsDesc': 'Track what works. Optimize automatically.',
    'features.footer': 'Stop paying $5K/month per social media manager. Our automated accounts do it all—and they never sleep.',
    'content.title': 'Content Creation Built In',
    'content.subtitle': 'Upload or generate your content in bulk in less than a couple of minutes. No more manual posting across multiple accounts.',
    'content.bulkUpload': 'Bulk Upload',
    'content.bulkUploadDesc': 'Upload multiple videos at once and distribute them across all your accounts.',
    'content.aiGeneration': 'AI Generation',
    'content.aiGenerationDesc': 'Generate content ideas and captions powered by AI in seconds.',
    'content.lightningFast': 'Lightning Fast',
    'content.lightningFastDesc': 'Create and schedule content for all accounts in under 2 minutes.',
    'content.smartDistribution': 'Smart Distribution',
    'content.smartDistributionDesc': 'Automatically distribute content across accounts with optimal timing.',
    'comparator.title': 'Why Choose Tasy?',
    'comparator.subtitle': 'Compare your options for managing multiple social media accounts',
    'comparator.diy': 'Do It Yourself',
    'comparator.freelancer': 'Freelancer/VA',
    'comparator.tasy': 'Tasy',
    'comparator.bestChoice': 'Best Choice',
    'comparator.accountCreation': 'Account Creation & Management',
    'comparator.automatedPosting': 'Automated Content Posting',
    'comparator.humanLikeEngagement': 'Human-Like Engagement',
    'comparator.realDeviceDeployment': 'Real Device Deployment',
    'comparator.scale': 'Scale to 100+ Accounts',
    'comparator.performanceAnalytics': 'Performance Analytics',
    'comparator.monthlyCost': 'Monthly Cost',
    'comparator.timeRequired': 'Time Required',
    'comparator.basic': 'Basic',
    'comparator.manualReports': 'Manual Reports',
    'comparator.realTimeDashboard': 'Real-time Dashboard',
    'comparator.yourTime': 'Your Time',
    'comparator.perAccount': '€125 per account',
    'comparator.hoursPerWeek': '20+ hours/week',
    'comparator.weeklyManagement': 'Weekly management',
    'comparator.zeroHours': '0 hours',
    'pricing.title': 'Simple, Transparent Pricing',
    'pricing.perAccount': 'Per Account',
    'pricing.scale': 'Scale as you grow',
    'pricing.price': '€125',
    'pricing.perMonth': '/account/month',
    'pricing.cta': 'Want Access? Apply Now',
    'pricing.description': 'Start with 10 accounts, scale to 100+. Cancel anytime.',
    'pricing.feature1': 'Account creation & verification',
    'pricing.feature2': 'Automated content posting',
    'pricing.feature3': 'Human-like engagement',
    'pricing.feature4': 'Real device deployment',
    'pricing.feature5': 'Performance analytics',
    'pricing.feature6': 'Dedicated support',
    'pricing.footer': 'Join founders already hitting millions of views with our automated accounts.',
    'faq.title': 'Frequently Asked Questions',
    'faq.subtitle': 'Can\'t find what you\'re looking for? Contact our',
    'faq.contact': 'customer support team',
    'faq.q1': 'How do you avoid getting accounts banned?',
    'faq.a1': 'We create accounts on real devices with real IPs, warm them up for weeks with human-like behavior, and deploy them across different locations. Our accounts behave exactly like real users—watching content, engaging naturally, and following platform guidelines.',
    'faq.q2': 'How fast can I start posting?',
    'faq.a2': 'Your accounts will be ready to deploy within 24 hours. However, for best results, we recommend letting us warm them up for 2-3 weeks before aggressive posting. This builds trust with platform algorithms and reduces the risk of flags.',
    'faq.q3': 'Do I need to create the videos myself?',
    'faq.a3': 'You can provide your own videos, or we can generate them for you using Tasy AI. Just tell us your niche and messaging, and we\'ll handle the content creation, posting, and engagement—completely hands-off.',
    'faq.q4': 'What kind of results can I expect?',
    'faq.a4': 'Results vary by niche and content quality, but our clients typically see 10-50x more reach compared to single-account strategies. With 50+ accounts posting and engaging, you\'re essentially running a small media company on autopilot.',
    'faq.q5': 'Is this safe and compliant?',
    'faq.a5': 'We operate in a grey area. Platforms don\'t explicitly allow automated accounts, but they can\'t detect ours because we use real devices, real behavior, and smart engagement patterns. We take precautions to minimize risk, but there\'s always a small chance of account loss.',
    'footer.copyright': 'Tasy AI',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    'footer.contact': 'Contact',
    'apply.title': 'Due to extreme demand, we are application-only',
    'apply.userType.question': 'What best describes you?',
    'apply.userType.brandOwner': 'Brand Owner',
    'apply.userType.agency': 'Agency',
    'apply.userType.affiliate': 'Affiliate',
    'apply.userType.founder': 'Founder',
    'apply.userType.other': 'Other',
    'apply.userType.specify': 'Please specify...',
    'apply.accounts.question': 'How many accounts do you want to post on?',
    'apply.accounts.description': 'Select up to 50 accounts. 2 posts/day/account. Distribute content however you\'d like. Accounts will be warmed up and customized for you. (TikTok & Instagram)',
    'apply.accounts.label': 'accounts',
    'apply.contact.name': 'Full Name',
    'apply.contact.email': 'Email',
    'apply.contact.company': 'Company (Optional)',
    'apply.contact.companyOptional': 'Your Company Inc.',
    'apply.contact.next': 'Next',
    'apply.contact.checking': 'Checking availability...',
    'apply.capacity.title': 'We\'ve Hit',
    'apply.capacity.count': '100/100',
    'apply.capacity.message': 'You\'re on our secondary waitlist without priority access. We\'re processing applications in order, and there are hundreds ahead of you.',
    'apply.priority.title': 'Pre-order 1 account & get priority access',
    'apply.priority.price': '€50',
    'apply.priority.originalPrice': '€125',
    'apply.priority.guarantee': '100% money-back guarantee if you decide not to proceed—no questions asked',
    'apply.priority.skip': 'Skip 500+ people waiting in line & get priority access when accounts are ready',
    'apply.priority.account': 'Your first account (worth €125/month) included at no extra cost',
    'apply.priority.preorder': 'Pre-order',
    'apply.priority.processing': 'Processing...',
    'apply.success.title': 'Thank you for securing your spot!',
    'apply.success.message': 'Your application has been submitted successfully.',
    'apply.continue': 'Continue',
    'apply.rolledOut': 'Rolled out to 72 users & scaling',
  },
  de: {
    'hero.title': 'Wir ersetzen ihre Social-Media-Manager',
    'hero.subtitle': 'Von Account-Erstellung bis Engagement: Wir posten, liken, kommentieren und verteilen bis zu 6.000 Beiträge im Monat – vollautomatisch, sicher und ohne Sperrungen.',
    'hero.cta': 'Du willst mitmachen? Jetzt bewerben',
    'hero.guarantee': 'Anti-Shadow-Ban Garantie',
    'hero.dashboardAlt': 'Tasy Analytics Dashboard mit 15,5 Mio. Views und 248K Followern',
    'header.features': 'Funktionen',
    'header.solution': 'Lösung',
    'header.pricing': 'Preise',
    'header.about': 'Über uns',
    'header.apply': 'Jetzt bewerben',
    'features.title': 'Alles läuft auf Autopilot',
    'features.createAccounts': 'Wir erstellen die Accounts',
    'features.createAccountsDesc': 'Vorverifizierte, gealterte, nischenspezifische Accounts, die in 24 Stunden einsatzbereit sind.',
    'features.warmUp': 'Wir erwärmen sie',
    'features.warmUpDesc': 'Wochen menschähnlicher Aktivität. Vertrauenswürdig für Plattform-Algorithmen.',
    'features.postContent': 'Wir posten Ihre Inhalte',
    'features.postContentDesc': 'Intelligente Planung über alle Accounts. Plattformoptimierte Formate.',
    'features.engage': 'Wir engagieren für Sie',
    'features.engageDesc': 'Automatisiertes Liken, Kommentieren, Teilen. Verhaltensmuster, die zu 100% menschlich aussehen.',
    'features.realDevices': 'Echte Geräte-Bereitstellung',
    'features.realDevicesDesc': 'Physische Telefone, keine Cloud-VMs. Echte IPs, echte Standorte.',
    'features.analytics': 'Performance-Analysen',
    'features.analyticsDesc': 'Verfolgen Sie, was funktioniert. Automatisch optimieren.',
    'features.footer': 'Hören Sie auf, 5.000 $/Monat pro Social-Media-Manager zu zahlen. Unsere automatisierten Accounts erledigen alles—und sie schlafen nie.',
    'content.title': 'Content-Erstellung integriert',
    'content.subtitle': 'Laden Sie Ihre Inhalte hoch oder generieren Sie sie in großen Mengen in weniger als ein paar Minuten. Kein manuelles Posten mehr über mehrere Accounts.',
    'content.bulkUpload': 'Massen-Upload',
    'content.bulkUploadDesc': 'Laden Sie mehrere Videos gleichzeitig hoch und verteilen Sie sie auf alle Ihre Accounts.',
    'content.aiGeneration': 'KI-Generierung',
    'content.aiGenerationDesc': 'Generieren Sie Content-Ideen und Bildunterschriften mit KI in Sekunden.',
    'content.lightningFast': 'Blitzschnell',
    'content.lightningFastDesc': 'Erstellen und planen Sie Inhalte für alle Accounts in unter 2 Minuten.',
    'content.smartDistribution': 'Intelligente Verteilung',
    'content.smartDistributionDesc': 'Verteilen Sie Inhalte automatisch über Accounts mit optimalem Timing.',
    'comparator.title': 'Warum Tasy wählen?',
    'comparator.subtitle': 'Vergleichen Sie Ihre Optionen für die Verwaltung mehrerer Social-Media-Accounts',
    'comparator.diy': 'Selbst machen',
    'comparator.freelancer': 'Freelancer/VA',
    'comparator.tasy': 'Tasy',
    'comparator.bestChoice': 'Beste Wahl',
    'comparator.accountCreation': 'Account-Erstellung & Verwaltung',
    'comparator.automatedPosting': 'Automatisiertes Content-Posten',
    'comparator.humanLikeEngagement': 'Menschähnliches Engagement',
    'comparator.realDeviceDeployment': 'Echte Geräte-Bereitstellung',
    'comparator.scale': 'Auf 100+ Accounts skalieren',
    'comparator.performanceAnalytics': 'Performance-Analysen',
    'comparator.monthlyCost': 'Monatliche Kosten',
    'comparator.timeRequired': 'Benötigte Zeit',
    'comparator.basic': 'Basis',
    'comparator.manualReports': 'Manuelle Berichte',
    'comparator.realTimeDashboard': 'Echtzeit-Dashboard',
    'comparator.yourTime': 'Ihre Zeit',
    'comparator.perAccount': '€125 pro Account',
    'comparator.hoursPerWeek': '20+ Stunden/Woche',
    'comparator.weeklyManagement': 'Wöchentliche Verwaltung',
    'comparator.zeroHours': '0 Stunden',
    'pricing.title': 'Einfache, transparente Preise',
    'pricing.perAccount': 'Pro Account',
    'pricing.scale': 'Skalieren Sie mit dem Wachstum',
    'pricing.price': '€125',
    'pricing.perMonth': '/Account/Monat',
    'pricing.cta': 'Du willst mitmachen? Jetzt bewerben',
    'pricing.description': 'Beginnen Sie mit 10 Accounts, skalieren Sie auf 100+. Jederzeit kündbar.',
    'pricing.feature1': 'Account-Erstellung & Verifizierung',
    'pricing.feature2': 'Automatisiertes Content-Posten',
    'pricing.feature3': 'Menschähnliches Engagement',
    'pricing.feature4': 'Echte Geräte-Bereitstellung',
    'pricing.feature5': 'Performance-Analysen',
    'pricing.feature6': 'Dedizierter Support',
    'pricing.footer': 'Schließen Sie sich Gründern an, die bereits Millionen von Views mit unseren automatisierten Accounts erreichen.',
    'faq.title': 'Häufig gestellte Fragen',
    'faq.subtitle': 'Können Sie nicht finden, wonach Sie suchen? Kontaktieren Sie unser',
    'faq.contact': 'Kundensupport-Team',
    'faq.q1': 'Wie vermeiden Sie, dass Accounts gesperrt werden?',
    'faq.a1': 'Wir erstellen Accounts auf echten Geräten mit echten IPs, erwärmen sie wochenlang mit menschähnlichem Verhalten und stellen sie an verschiedenen Standorten bereit. Unsere Accounts verhalten sich genau wie echte Nutzer—sehen Inhalte an, engagieren sich natürlich und befolgen Plattformrichtlinien.',
    'faq.q2': 'Wie schnell kann ich mit dem Posten beginnen?',
    'faq.a2': 'Ihre Accounts sind innerhalb von 24 Stunden einsatzbereit. Für beste Ergebnisse empfehlen wir jedoch, sie 2-3 Wochen aufwärmen zu lassen, bevor aggressiv gepostet wird. Dies schafft Vertrauen bei Plattform-Algorithmen und reduziert das Risiko von Flagging.',
    'faq.q3': 'Muss ich die Videos selbst erstellen?',
    'faq.a3': 'Sie können Ihre eigenen Videos bereitstellen, oder wir können sie für Sie mit Tasy AI generieren. Teilen Sie uns einfach Ihre Nische und Botschaft mit, und wir übernehmen die Content-Erstellung, das Posten und das Engagement—komplett ohne Ihr Zutun.',
    'faq.q4': 'Welche Ergebnisse kann ich erwarten?',
    'faq.a4': 'Die Ergebnisse variieren je nach Nische und Content-Qualität, aber unsere Kunden sehen typischerweise 10-50x mehr Reichweite im Vergleich zu Einzel-Account-Strategien. Mit 50+ Accounts, die posten und sich engagieren, betreiben Sie im Wesentlichen ein kleines Medienunternehmen auf Autopilot.',
    'faq.q5': 'Ist das sicher und konform?',
    'faq.a5': 'Wir operieren in einer Grauzone. Plattformen erlauben automatisierte Accounts nicht explizit, aber sie können unsere nicht erkennen, weil wir echte Geräte, echtes Verhalten und intelligente Engagement-Muster verwenden. Wir treffen Vorsichtsmaßnahmen, um Risiken zu minimieren, aber es besteht immer eine kleine Chance auf Account-Verlust.',
    'footer.copyright': 'Tasy AI',
    'footer.privacy': 'Datenschutz',
    'footer.terms': 'AGB',
    'footer.contact': 'Kontakt',
    'apply.title': 'Aufgrund der extremen Nachfrage sind wir nur auf Bewerbungen angewiesen',
    'apply.userType.question': 'Was beschreibt Sie am besten?',
    'apply.userType.brandOwner': 'Markeninhaber',
    'apply.userType.agency': 'Agentur',
    'apply.userType.affiliate': 'Affiliate',
    'apply.userType.founder': 'Gründer',
    'apply.userType.other': 'Sonstiges',
    'apply.userType.specify': 'Bitte angeben...',
    'apply.accounts.question': 'Auf wie vielen Accounts möchten Sie posten?',
    'apply.accounts.description': 'Wählen Sie bis zu 50 Accounts. 2 Posts/Tag/Account. Verteilen Sie Inhalte wie Sie möchten. Accounts werden für Sie aufgewärmt und angepasst. (TikTok & Instagram)',
    'apply.accounts.label': 'Accounts',
    'apply.contact.name': 'Vollständiger Name',
    'apply.contact.email': 'E-Mail',
    'apply.contact.company': 'Firma (Optional)',
    'apply.contact.companyOptional': 'Ihre Firma GmbH',
    'apply.contact.next': 'Weiter',
    'apply.contact.checking': 'Verfügbarkeit prüfen...',
    'apply.capacity.title': 'Wir haben',
    'apply.capacity.count': '100/100',
    'apply.capacity.message': 'Sie sind auf unserer Warteliste ohne Prioritätszugang. Wir bearbeiten Bewerbungen in Reihenfolge, und es stehen Hunderte vor Ihnen.',
    'apply.priority.title': '1 Account vorbestellen & Prioritätszugang erhalten',
    'apply.priority.price': '€50',
    'apply.priority.originalPrice': '€125',
    'apply.priority.guarantee': '100% Geld-zurück-Garantie, wenn Sie sich entscheiden nicht fortzufahren—keine Fragen gestellt',
    'apply.priority.skip': 'Überspringen Sie 500+ wartende Personen & erhalten Sie Prioritätszugang, wenn Accounts bereit sind',
    'apply.priority.account': 'Ihr erster Account (im Wert von €125/Monat) ohne zusätzliche Kosten enthalten',
    'apply.priority.preorder': 'Vorbestellen',
    'apply.priority.processing': 'Wird verarbeitet...',
    'apply.success.title': 'Vielen Dank, dass Sie Ihren Platz gesichert haben!',
    'apply.success.message': 'Ihre Bewerbung wurde erfolgreich eingereicht.',
    'apply.continue': 'Weiter',
    'apply.rolledOut': 'An 72 Nutzer ausgerollt & skalierend',
  },
};

