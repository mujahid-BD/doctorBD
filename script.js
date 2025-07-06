let doctors = [];
let currentPage = 1;
const itemsPerPage = 2;
let currentLang = 'en';

function translateUI() {
  const dict = currentLang === 'bn' ? lang_bn : lang_en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) el.setAttribute('placeholder', dict[key]);
  });
}

document.getElementById('languageSwitcher').addEventListener('change', (e) => {
  currentLang = e.target.value;
  translateUI();
  renderDoctors();
});

fetch("doctors.json")
  .then((res) => res.json())
  .then((data) => {
    doctors = data;
    populateFilters();
    renderDoctors();
    translateUI();
  });

function populateFilters() {
  const districts = [...new Set(doctors.map(d => d.district))];
  const specialities = [...new Set(doctors.map(d => d.speciality))];

  const districtFilter = document.getElementById("districtFilter");
  const specialityFilter = document.getElementById("specialityFilter");

  districts.forEach(d => {
    const option = document.createElement("option");
    option.value = d;
    option.textContent = d;
    districtFilter.appendChild(option);
  });

  specialities.forEach(s => {
    const option = document.createElement("option");
    option.value = s;
    option.textContent = s;
    specialityFilter.appendChild(option);
  });
}

function renderDoctors() {
  const searchTerm = document.getElementById("searchBox").value.toLowerCase();
  const district = document.getElementById("districtFilter").value;
  const speciality = document.getElementById("specialityFilter").value;
  const dict = currentLang === 'bn' ? lang_bn : lang_en;

  let filtered = doctors.filter(d => {
    return (
      (d.name.toLowerCase().includes(searchTerm) ||
       d.hospital.toLowerCase().includes(searchTerm) ||
       d.district.toLowerCase().includes(searchTerm)) &&
      (district === "" || d.district === district) &&
      (speciality === "" || d.speciality === speciality)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const container = document.getElementById("doctorList");
  container.innerHTML = "";

  paginated.forEach(d => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${d.name}</h3>
      <p>📚 ${dict["degree"]}: ${d.degree}</p>
      <p>🩺 ${dict["speciality"]}: ${d.speciality}</p>
      <p>🏥 ${dict["hospital"]}: ${d.hospital}</p>
      <p>📍 ${dict["district"]}: ${d.district}</p>
    `;
    container.appendChild(card);
  });

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = "page-btn";
    btn.textContent = i;
    if (i === currentPage) btn.style.backgroundColor = "#005846";
    btn.onclick = () => {
      currentPage = i;
      renderDoctors();
    };
    pagination.appendChild(btn);
  }
}

document.getElementById("searchBox").addEventListener("input", () => {
  currentPage = 1;
  renderDoctors();
});

document.getElementById("districtFilter").addEventListener("change", () => {
  currentPage = 1;
  renderDoctors();
});

document.getElementById("specialityFilter").addEventListener("change", () => {
  currentPage = 1;
  renderDoctors();
});
