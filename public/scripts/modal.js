function setupModal() {
  const modal = document.getElementById("training-modal");
  const closeModalButton = document.getElementById("close-modal-button");
  const openModalButton = document.getElementById("open-modal-button");

  if (!modal || !closeModalButton || !openModalButton) {
    console.error("Ein oder mehrere notwendige Elemente fehlen.");
    return;
  }

  openModalButton.addEventListener("click", () => {
    modal.style.display = "block";
  });

  closeModalButton.addEventListener("click", () => {
    modal.style.display = "none";
  });
}
