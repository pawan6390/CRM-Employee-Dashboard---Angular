import { CommonModule } from "@angular/common";
import {
  Component,
  computed,
  effect,
  linkedSignal,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";

type Theme = "light" | "dark";
type EmailFrequency = "daily" | "weekly" | "never";

const THEME_KEY = "crm_theme";
const PREFS_KEY = "crm_preferences";

@Component({
  selector: "app-settings",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./settings.component.html",
  styleUrl: "./settings.component.scss",
})
export class SettingsComponent {
  readonly theme = signal<Theme>(
    (localStorage.getItem(THEME_KEY) as Theme) || "light",
  );
  readonly isDark = computed(() => this.theme() === "dark");

  private readonly themeEffect = effect(() => {
    document.documentElement.setAttribute("data-theme", this.theme());
    localStorage.setItem(THEME_KEY, this.theme());
  });

  readonly notificationsEnabled = signal(true);

  readonly emailFrequency = linkedSignal<EmailFrequency>(() =>
    this.notificationsEnabled() ? "daily" : "never",
  );

  readonly pushEnabled = signal(true);
  readonly smsEnabled = signal(false);

  private readonly storedPrefs = this.readStoredPreferences();
  readonly language = signal(this.storedPrefs.language);
  readonly compactMode = signal(this.storedPrefs.compactMode);
  readonly pageSize = signal(this.storedPrefs.pageSize);

  private readonly prefsEffect = effect(() => {
    const prefs = {
      language: this.language(),
      compactMode: this.compactMode(),
      pageSize: this.pageSize(),
    };
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  });

  private readStoredPreferences(): {
    language: string;
    compactMode: boolean;
    pageSize: number;
  } {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { language: "en", compactMode: false, pageSize: 10 };
    try {
      return JSON.parse(raw);
    } catch {
      return { language: "en", compactMode: false, pageSize: 10 };
    }
  }

  toggleTheme(): void {
    this.theme.set(this.isDark() ? "light" : "dark");
  }
}
