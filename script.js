document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("js");

  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".site-nav");

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isExpanded));
      navigation.classList.toggle("is-open", !isExpanded);
    });

    navigation.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement && window.matchMedia("(max-width: 1099px)").matches) {
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

  const projectType = form.querySelector("#project-type");
  const deliveryMethod = form.querySelector("#delivery-method");
  const deliveryLocation = form.querySelector("#delivery-location");
  const locationRequirement = form.querySelector("[data-location-requirement]");
  const deliveryField = form.querySelector("#delivery-location")?.closest("[data-delivery-extra]");
  const pickupNote = form.querySelector("[data-pickup-note]");
  const mailtoFallback = form.querySelector("[data-mailto-fallback]");
  const validProjectTypes = ["laser", "3d-printing", "other"];

  if (projectType) {
    const requestedType = new URLSearchParams(window.location.search).get("type");
    if (requestedType && validProjectTypes.includes(requestedType)) {
      projectType.value = requestedType;
    }
  }

  const updateDeliveryDetails = () => {
    if (!deliveryMethod) return;

    const needsLocation = ["local-delivery", "shipping"].includes(deliveryMethod.value);
    if (deliveryField) deliveryField.hidden = !needsLocation;
    if (deliveryLocation) {
      deliveryLocation.required = needsLocation;
      deliveryLocation.setAttribute("aria-required", String(needsLocation));
      if (!needsLocation) deliveryLocation.value = "";
    }
    if (locationRequirement) locationRequirement.textContent = needsLocation ? "(required)" : "(optional)";
    if (pickupNote) pickupNote.hidden = deliveryMethod.value !== "pickup";
  };

  const updateMailtoFallback = () => {
    if (!mailtoFallback) return;

    const selectedProject = projectType?.selectedOptions[0]?.textContent?.trim() || "";
    const selectedDelivery = deliveryMethod?.selectedOptions[0]?.textContent?.trim() || "";
    const fields = [
      ["Project type", selectedProject],
      ["Preferred delivery method", selectedDelivery],
      ["Town or postal code", deliveryLocation?.value.trim() || ""],
      ["Name", form.elements.namedItem("name")?.value.trim() || ""],
      ["Email", form.elements.namedItem("email")?.value.trim() || ""],
      ["What you want", form.elements.namedItem("request")?.value.trim() || ""],
      ["Quantity", form.elements.namedItem("quantity")?.value.trim() || ""],
      ["Material or item type", form.elements.namedItem("material")?.value.trim() || ""]
    ];
    const body = fields.map(([label, value]) => `${label}: ${value}`).join("\n");
    mailtoFallback.href = `mailto:[EMAIL]?subject=Quote%20request&body=${encodeURIComponent(body)}`;
  };

  deliveryMethod?.addEventListener("change", () => {
    updateDeliveryDetails();
    updateMailtoFallback();
  });
  form.addEventListener("input", updateMailtoFallback);
  form.addEventListener("change", updateMailtoFallback);
  updateDeliveryDetails();
  updateMailtoFallback();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "";
    status.removeAttribute("data-state");
    updateMailtoFallback();

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
