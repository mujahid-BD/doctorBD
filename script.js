document.addEventListener("DOMContentLoaded", function () {
  let doctors = [];
  let filteredDoctors = [];
  let currentPage = 1;
  const perPage = 6;
  let currentLang = 'en';

  const dict = () => (currentLang === 'bn' ? lang_bn : lang_en);

  fetch("https://script.google.com/macros/s/AKfycbzsIvCV16mKps0gj2Zq-d10E1dHnXXqwJ_Y-tUq-KGq9atrKQ8gdaTiRLqGM6rYvE0/exec")
    .then(res => res.json())
    .then(data => {
      doctors = data;
      filteredDoctors = [...doctors];
      populateFilters();
      renderDoctors();
    });

  function populateFilters() {
    const districtSet = new Set();
    const specialitySet = new Set();

    doctors.forEach(d => {
      districtSet.add(currentLang === 'bn' ? d.district_bn : d.district_en);
      specialitySet.add(currentLang === 'bn' ? d.speciality_bn : d.speciality_en);
    });

    const districtFilter = document.getElementById("districtFilter");
    const specialityFilter = document.getElementById("specialityFilter");

    districtFilter.innerHTML = `<option value="">${dict()["district"]}</option>`;
    specialityFilter.innerHTML = `<option value="">${dict()["speciality"]}</option>`;

    Array.from(districtSet).sort().forEach(d => {
      const opt = document.createElement("option");
      opt.value = d;
      opt.textContent = d;
      districtFilter.appendChild(opt);
    });

    Array.from(specialitySet).sort().forEach(s => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      specialityFilter.appendChild(opt);
    });
  }

  function renderDoctors() {
    const container = document.getElementById("doctorList");
    container.innerHTML = "";

    const start = (currentPage - 1) * perPage;
    const paginated = filteredDoctors.slice(start, start + perPage);

    paginated.forEach(d => {
      const name = currentLang === 'bn' ? d.name_bn : d.name_en;
      const degree = currentLang === 'bn' ? d.degree_bn : d.degree_en;
      const speciality = currentLang === 'bn' ? d.speciality_bn : d.speciality_en;
      const hospital = currentLang === 'bn' ? d.hospital_bn : d.hospital_en;
      const district = currentLang === 'bn' ? d.district_bn : d.district_en;

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${name}</h3>
        <p>📚 ${dict()["degree"]}: ${degree}</p>
        <p>🩺 ${dict()["speciality"]}: ${speciality}</p>
        <p>🏥 ${dict()["hospital"]}: ${hospital}</p>
        <p>📍 ${dict()["district"]}: ${district}</p>
        <button class="review-btn" onclick="openReviewModal('${d.id}')">Review this doctor</button>
      `;
      container.appendChild(card);
    });

    renderPagination();
  }

  function renderPagination() {
    const totalPages = Math.ceil(filteredDoctors.length / perPage);
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.onclick = () => {
        currentPage = i;
        renderDoctors();
      };
      if (i === currentPage) btn.classList.add("active");
      pagination.appendChild(btn);
    }
  }

  document.getElementById('languageSwitcher').addEventListener('change', (e) => {
    currentLang = e.target.value;
    translateUI();
    populateFilters();
    applyFilters();
  });

  document.getElementById("search").addEventListener("input", applyFilters);
  document.getElementById("districtFilter").addEventListener("change", applyFilters);
  document.getElementById("specialityFilter").addEventListener("change", applyFilters);

  function applyFilters() {
    const search = document.getElementById("search").value.toLowerCase();
    const district = document.getElementById("districtFilter").value;
    const speciality = document.getElementById("specialityFilter").value;

    filteredDoctors = doctors.filter(d => {
      const name = currentLang === 'bn' ? d.name_bn : d.name_en;
      const degree = currentLang === 'bn' ? d.degree_bn : d.degree_en;
      const hosp = currentLang === 'bn' ? d.hospital_bn : d.hospital_en;
      const dist = currentLang === 'bn' ? d.district_bn : d.district_en;
      const spec = currentLang === 'bn' ? d.speciality_bn : d.speciality_en;

      return (
        (name + degree + hosp + dist + spec).toLowerCase().includes(search) &&
        (district === "" || dist === district) &&
        (speciality === "" || spec === speciality)
      );
    });

    currentPage = 1;
    renderDoctors();
  }

  function translateUI() {
    const d = dict();
    document.getElementById("title").textContent = d["title"];
    document.getElementById("search").placeholder = d["search_placeholder"];
  }

  // Review modal opener (global function)
  window.openReviewModal = function(doctorId) {
    document.getElementById("reviewDoctorId").value = doctorId;
    document.getElementById("reviewModal").style.display = "block";
  };
});
