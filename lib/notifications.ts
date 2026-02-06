import { LocalNotifications } from '@capacitor/local-notifications';

export const NotificationService = {
    async requestPermissions() {
        try {
            const result = await LocalNotifications.requestPermissions();
            return result.display === 'granted';
        } catch (e) {
            console.error("Notification permission error:", e);
            return false;
        }
    },

    async scheduleDailyReminder() {
        try {
            const permissions = await LocalNotifications.checkPermissions();
            if (permissions.display !== 'granted') {
                const granted = await this.requestPermissions();
                if (!granted) return;
            }

            // Check if already scheduled
            const pending = await LocalNotifications.getPending();
            const hasDaily = pending.notifications.some(n => n.id === 100);

            if (!hasDaily) {
                await LocalNotifications.schedule({
                    notifications: [
                        {
                            title: "System Alert",
                            body: "Your daily quest is pending. Log your activity to maintain your rank.",
                            id: 100,
                            schedule: {
                                on: { hour: 18, minute: 0 }, // 6:00 PM
                                allowWhileIdle: true,
                            },
                        }
                    ]
                });
                console.log("Daily reminder scheduled for 18:00");
            }
        } catch (e) {
            console.error("Schedule error:", e);
        }
    },

    async sendInstantNotification(title: string, body: string) {
        try {
            await LocalNotifications.schedule({
                notifications: [
                    {
                        title: title,
                        body: body,
                        id: Math.floor(Math.random() * 100000) + 200, // Random ID > 100
                        schedule: { at: new Date(Date.now() + 1000) } // 1 sec delay
                    }
                ]
            });
        } catch (e) {
            console.error("Instant notification error:", e);
        }
    }
};
