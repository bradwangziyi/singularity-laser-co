document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".site-nav");

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isExpanded));
      navigation.classList.toggle("is-open", !isExpanded);
    });

    navigation.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement && window.matchMedia("(max-width: 859px)").matches) {
        menuButton.setAttribute("aria-expanded", "false");
        navigation.classList.remove("is-open");
      }
    });
  }

  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  const form = document.querySelector("[data-quote-form]");
  const status = document.querySelector("[data-form-status]");
  if (!form || !status) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "";
    status.removeAttribute("data-state");

    if (!form.reportValidity()) return;

    const endpoint = form.getAttribute("action")?.trim();
    if (!endpoint || endpoint === "[FORM_ENDPOINT]" || endpoint.includes("[PLACEHOLDER]")) {
      status.dataset.state = "error";
      status.textContent = "The quote form is not connected yet. Please use the email link below, or contact the owner to set a form endpoint.";
      status.focus();
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    status.textContent = "Sending your request…";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });

      if (!response.ok) throw new Error(`Form service returned ${response.status}`);
      form.reset();
      status.dataset.state = "success";
      status.textContent = "Thanks—your quote request has been sent. We’ll be in touch soon.";
      status.focus();
    } catch (error) {
      console.error("Quote form submission failed:", error);
      status.dataset.state = "error";
      status.textContent = "We couldn’t send your request. Please try again or email us using the link below.";
      status.focus();
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
});
