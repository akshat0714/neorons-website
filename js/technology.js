/* The full explanation remains available when JavaScript is off. */
(() => {
  const guide = document.querySelector(".diagram-guide");
  const explanation = document.querySelector(".stage-explanation");
  const diagram = document.querySelector(".voice-architecture");
  if (!guide || !explanation || !diagram) return;
  const stages = {
    recognition: [
      "Turning speech into a transcript.",
      "Automatic speech recognition (ASR) maps audio to text. Accents, background noise, and changes between languages can affect the transcript a system receives.",
    ],
    context: [
      "Carrying the conversation forward.",
      "A language model receives a bounded context: the current transcript and relevant preceding turns. What is included or omitted affects the response. This diagram does not specify Neorons’ context handling.",
    ],
    generation: [
      "Generating the response.",
      "An autoregressive language model predicts successive tokens conditioned on its input. A fluent response can still be incorrect; generation alone does not establish reliability or clinical suitability.",
    ],
    speech: [
      "Giving text a voice.",
      "Text-to-speech (TTS) synthesis produces spoken audio from response text. Pronunciation, intelligibility, pacing, and the supported languages depend on the implementation.",
    ],
  };
  function select(stage) {
    if (!stages[stage]) return;
    guide
      .querySelectorAll("button")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.stage === stage),
        ),
      );
    diagram
      .querySelectorAll("[data-diagram-stage]")
      .forEach((node) =>
        node.classList.toggle(
          "is-selected",
          node.dataset.diagramStage === stage,
        ),
      );
    explanation.querySelector("h3").textContent = stages[stage][0];
    explanation.querySelector("p").textContent = stages[stage][1];
  }
  guide.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-stage]");
    if (button) select(button.dataset.stage);
  });
  select("recognition");
})();
