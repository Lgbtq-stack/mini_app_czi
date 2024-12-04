document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal");
    const openModalBtn = document.querySelector(".withdraw-btn");
    const closeModalBtn = document.getElementById("closeModal");

    openModalBtn.addEventListener("click", () => {
        modal.classList.add("show");
    });

    closeModalBtn.addEventListener("click", () => {
        modal.classList.remove("show");
    });

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.remove("show");
        }
    });
});
