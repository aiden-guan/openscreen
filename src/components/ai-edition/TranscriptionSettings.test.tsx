// @vitest-environment jsdom
import "@testing-library/jest-dom";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/contexts/I18nContext";
import { loadUserPreferences, saveUserPreferences } from "@/lib/userPreferences";

const store = vi.hoisted(() => ({ setAutoTranscribe: vi.fn() }));

vi.mock("@/lib/ai-edition/store/transcriptionStore", () => ({
	useTranscriptionStore: { getState: () => store },
}));

import { TranscriptionSettings } from "./TranscriptionSettings";

function renderSection() {
	return render(
		<I18nProvider>
			<TranscriptionSettings open />
		</I18nProvider>,
	);
}

describe("TranscriptionSettings", () => {
	beforeEach(() => {
		store.setAutoTranscribe.mockReset();
	});
	afterEach(() => {
		cleanup();
		localStorage.clear();
	});

	it("shows automatic transcription on by default", () => {
		renderSection();
		expect(screen.getByTestId("auto-transcribe-toggle")).toHaveAttribute("aria-pressed", "true");
		expect(screen.getByText(/huggingface\.co/)).toBeInTheDocument();
	});

	it("reflects the saved preference", () => {
		saveUserPreferences({ autoTranscribe: false });
		renderSection();
		expect(screen.getByTestId("auto-transcribe-toggle")).toHaveAttribute("aria-pressed", "false");
	});

	it("hands the switch to the transcription store", () => {
		renderSection();
		fireEvent.click(screen.getByTestId("auto-transcribe-toggle"));
		expect(store.setAutoTranscribe).toHaveBeenCalledWith(false);
		expect(screen.getByTestId("auto-transcribe-toggle")).toHaveAttribute("aria-pressed", "false");
		// Persisting is the store's job; the section only asks it.
		expect(loadUserPreferences().autoTranscribe).toBe(true);
	});
});
