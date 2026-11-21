<script lang="ts">
  import { onMount, tick } from "svelte";
  import { cn } from "../../utils/cn";
  import type {
    ChoiceOption,
    DropdownMobilePresentation,
  } from "./types";

  type Props = {
    label: string;
    value: string;
    options: readonly ChoiceOption[];
    onchange: (value: string) => void;
    mobilePresentation?: DropdownMobilePresentation;
  };

  let {
    label,
    value,
    options,
    onchange,
    mobilePresentation = "bottom-sheet",
  }: Props = $props();
  let trigger = $state<HTMLButtonElement | null>(null);
  let desktopMenu = $state<HTMLDivElement | null>(null);
  let sheet = $state<HTMLDialogElement | null>(null);
  let sheetCard = $state<HTMLDivElement | null>(null);
  let open = $state(false);
  let isMobile = $state(false);
  const usesBottomSheet = $derived(
    isMobile && mobilePresentation === "bottom-sheet",
  );
  const usesPopover = $derived(!usesBottomSheet);
  const selected = $derived(
    options.find((option) => option.value === value) || options[0],
  );

  onMount(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const sync = () => {
      isMobile = media.matches;
      if (open && !isMobile) close(false);
    };
    sync();
    media.addEventListener("change", sync);

    return () => media.removeEventListener("change", sync);
  });

  $effect(() => {
    if (!open || usesBottomSheet) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!trigger?.parentElement?.contains(target)) close(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  $effect(() => {
    if (!open || !usesBottomSheet) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (sheetCard?.contains(target)) return;
      event.preventDefault();
      event.stopPropagation();
      close();
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  });

  async function toggle() {
    if (open) {
      close();
      return;
    }

    open = true;
    if (usesBottomSheet) {
      sheet?.showModal();
    }
    await tick();
    const menu = usesBottomSheet ? sheet : desktopMenu;
    menu?.querySelector<HTMLButtonElement>('[role="option"]')?.focus();
  }

  function close(restoreFocus = true) {
    if (sheet?.open) sheet.close();
    open = false;
    if (restoreFocus) trigger?.focus();
  }

  function choose(nextValue: string) {
    onchange(nextValue);
    close();
  }
</script>

<div class="relative min-w-0">
  <button
    bind:this={trigger}
    type="button"
    aria-haspopup="listbox"
    aria-expanded={open}
    aria-label={`${label}: ${selected.label}`}
    class="group relative flex min-h-12 w-full items-center justify-between gap-2.5 overflow-hidden rounded-pill border border-line bg-[#111] px-3 text-left text-foreground transition-colors hover:border-foreground/25 hover:bg-[#1b1b1b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
    onclick={toggle}
  >
    <span class="min-w-0 flex-1">
      <span class="block whitespace-nowrap text-[10px] font-medium leading-none text-muted">
        {label}
      </span>
      <span class="mt-1 block truncate text-[13px] font-bold leading-tight">
        {selected.label}
      </span>
    </span>
    <span
      class="grid size-7 shrink-0 place-items-center rounded-full border border-line/80 bg-foreground/[0.035]"
    >
      <svg
        class={cn(
          "size-4 text-muted transition-transform",
          open && "rotate-180",
        )}
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.5" />
      </svg>
    </span>
  </button>

  {#if open && usesPopover}
    <div
      bind:this={desktopMenu}
      class="absolute left-0 top-[calc(100%+0.5rem)] z-30 min-w-full overflow-hidden rounded-control border border-line bg-[#202020] p-1 shadow-2xl shadow-black/50"
      role="listbox"
      aria-label={label}
    >
      {#each options as option (option.value)}
        <button
          type="button"
          role="option"
          aria-selected={option.value === value}
          class={cn(
            "flex min-h-10 w-full items-center justify-between gap-3 rounded-pill px-3 text-left text-sm",
            "hover:bg-foreground/10 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-highlight",
            option.value === value
              ? "bg-highlight/[0.08] font-bold text-foreground"
              : "text-muted",
          )}
          onclick={() => choose(option.value)}
        >
          <span class="flex items-center gap-2">
            <span
              class={cn(
                "size-1.5 rounded-full",
                option.value === value ? "bg-highlight" : "bg-foreground/15",
              )}
              aria-hidden="true"
            ></span>
            {option.label}
          </span>
          {#if option.value === value}<span class="text-highlight">✓</span>{/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

{#if usesBottomSheet}
  <dialog
    bind:this={sheet}
    class="sheet-dialog pointer-events-none fixed inset-0 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-black/55"
    aria-label={label}
    oncancel={(event) => {
      event.preventDefault();
      close();
    }}
  >
    <div class="pointer-events-none flex h-full items-end">
      <div
        bind:this={sheetCard}
        class="sheet-card pointer-events-auto w-full rounded-t-[1.25rem] border-x border-t border-white/[0.1] bg-gradient-to-b from-[#2b2b2b]/85 to-[#141414]/90 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_-20px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
      >
        <div class="mb-4 flex items-center justify-between gap-4">
          <h2 class="m-0 text-lg font-bold">{label}</h2>
          <button
            type="button"
            aria-label={`Close ${label}`}
            class="grid size-10 place-items-center rounded-full border border-line text-muted hover:bg-foreground/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
            onclick={() => close()}
          >
            <svg
              class="size-5"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="m5 5 10 10M15 5 5 15"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
        <div role="listbox" aria-label={label} class="grid gap-1">
          {#each options as option (option.value)}
            <button
              type="button"
              role="option"
              aria-selected={option.value === value}
              class={cn(
                "flex min-h-12 items-center justify-between rounded-pill px-3 text-left text-base",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight",
                option.value === value
                  ? "border border-highlight/20 bg-highlight/[0.08] font-bold text-foreground"
                  : "text-muted",
              )}
              onclick={() => choose(option.value)}
            >
              {option.label}
              {#if option.value === value}
                <span class="text-highlight">✓</span>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    </div>
  </dialog>
{/if}

<style>
  .sheet-dialog[open].sheet-dialog::backdrop {
    animation: sheet-backdrop-in 180ms ease-out both;
  }

  .sheet-dialog[open].sheet-dialog .sheet-card {
    animation: sheet-rise-in 240ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }

  @keyframes sheet-backdrop-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes sheet-rise-in {
    from {
      opacity: 0;
      transform: translateY(1.5rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .sheet-dialog[open].sheet-dialog::backdrop,
    .sheet-dialog[open].sheet-dialog .sheet-card {
      animation: none;
    }
  }
</style>
