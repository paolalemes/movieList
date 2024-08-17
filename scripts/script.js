const movieCollection = document.getElementById("movie-collection");
const movieModal = document.getElementById("movie-bg");
const tvCollection = document.getElementById("tv-collection");
const tvModal = document.getElementById("tv-bg");
const listCollection = document.getElementById("list-collection");
const listModal = document.getElementById("list-modal");
let currentMoviePage = 1;
let currentTvPage = 1;
let userMovieAndTvList = JSON.parse(localStorage.getItem("userMovieAndTvList")) ?? [];

async function getApiData(collection, page = 1) {
  try {
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0ZDBlMWQyYThiYzUyYjdjMTcxZGI4NGIxZmVmZDI4ZiIsIm5iZiI6MTcyMzU3ODAyNi43MzYyMTUsInN1YiI6IjY1MWM3NjAyNjVjMjZjMDBhZWM4ZGQzNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.nxg2Wr95wydW_Sxbq3vCAw88aSNYlR2b2M6_VX2jsLM",
      },
    };

    const api = await fetch(`https://api.themoviedb.org/3/${collection}/popular?language=pt-BR&page=${page}`, options);
    const response = await api.json();
    const data = response.results;
    return data;
  } catch (err) {
    console.log(err);
    showAlert();
  }
}

async function showCollection(collection, page = 1) {
  const data = await getApiData(collection, page);
  for (let info of data) {
    const article = document.createElement("article");
    article.classList.add("card");
    article.setAttribute("id", info.id);
    const title = collection == "tv" ? info.name : info.title;
    article.innerHTML = `
        <img class="poster" src="https://image.tmdb.org/t/p/w500${info.poster_path}" alt="poster de ${title}" />
          <p class="title">${title}</p>
          <div class="actions">
            <button class="show" onclick="showDetails('${collection}', '${info.id}')">
              <lord-icon
                src="https://cdn.lordicon.com/vfczflna.json"
                trigger="hover"
                stroke="bold"
                colors="primary:#121331,secondary:#fb8500"
                style="width: 30px; height: 30px"
              >
              </lord-icon>
            </button>
            <button class="btn" onclick="addToList('${collection}', '${info.id}', '${title}','${info.poster_path}')">Adicionar à lista</button>
          </div>
    `;
    document.getElementById(`${collection}-collection`).append(article);
  }
}

function handleInfiniteScroll(collection) {
  if (collection == "tv") {
    currentTvPage++;
    showCollection("tv", currentTvPage);
  } else {
    currentMoviePage++;
    showCollection("movie", currentMoviePage);
  }
}

async function getDetails(collection, id) {
  try {
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0ZDBlMWQyYThiYzUyYjdjMTcxZGI4NGIxZmVmZDI4ZiIsIm5iZiI6MTcyMzY2Njc3MS41NTQ2NzMsInN1YiI6IjY1MWM3NjAyNjVjMjZjMDBhZWM4ZGQzNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.q_5HyCAFRQTpVQkQ8V7zh-oMSwQjse9BrfYc1TepHs8",
      },
    };

    const api = await fetch(`https://api.themoviedb.org/3/${collection}/${id}?language=pt-BR`, options);
    const response = await api.json();
    return response;
  } catch (err) {
    showAlert();
  }
}

async function showDetails(collection, id) {
  const details = await getDetails(collection, id);
  let gerenos = "";
  for (const genero of details.genres) {
    gerenos += `${genero.name}/ `;
  }
  const modal = document.getElementById(`modal`);
  const title = collection == "tv" ? details.name : details.title;
  modal.innerHTML = `
    <div class="background" onclick="closeModal('${collection}')"></div>
        <div class="content">
          <img class="poster" src="https://image.tmdb.org/t/p/w500${details.poster_path}" alt="poster de ${title} " />
          <div class="info">
            <p class="title">${title}</p>
            <p>
              ${details.overview}
            </p>
            <p> ${gerenos} </p>
            <button class="btn" onclick="addToList('${collection}', '${details.id}', '${title}','${details.poster_path}')">Adicionar à lista</button>
          </div>
        </div>
  `;
  modal.classList.add("open");
}

function closeModal(collection) {
  const modal = document.getElementById(`modal`);
  modal.classList.remove("open");
}

function addToList(collection, id, title, poster) {
  if (verifyItemOnList(userMovieAndTvList, id)) {
    return;
  }
  userMovieAndTvList.push({ id, title, poster, collection });
  localStorage.setItem("userMovieAndTvList", JSON.stringify(userMovieAndTvList));
}

function verifyItemOnList(list, id) {
  function searchID(data) {
    return data.id === id;
  }
  return Boolean(list.find(searchID));
}

function showUserlist(collection, list) {
  const collectionSection = document.getElementById(`${collection}-list-collection`);
  if (list.length > 0) {
    collectionSection.innerHTML = "";
    for (let item of list) {
      const article = document.createElement("article");
      article.classList.add("card");
      article.setAttribute("id", item.id);
      article.innerHTML = `
                <img class="poster" src="https://image.tmdb.org/t/p/w500${item.poster}" alt="poster de ${item.title}" />
          <p class="title">${item.title}</p>
          <div class="actions">
            <button class="show" onclick="showDetails('${collection}', '${item.id}')">
              <lord-icon
                src="https://cdn.lordicon.com/vfczflna.json"
                trigger="hover"
                stroke="bold"
                colors="primary:#121331,secondary:#fb8500"
                style="width: 30px; height: 30px"
              >
              </lord-icon>
            </button>
            <button class="show" onclick="removeFromList('${item.id}')">
              <lord-icon
                src="https://cdn.lordicon.com/drxwpfop.json"
                trigger="hover"
                stroke="bold"
                colors="primary:#121331,secondary:#fb8500"
                style="width: 25px; height: 25px"
              >
              </lord-icon>
            </button>
          </div>
            `;

      collectionSection.append(article);
    }
  } else {
    collectionSection.innerHTML = "<p>Sua lista está vazia</p>";
  }
}

function loadList() {
  let movieList = userMovieAndTvList.filter((item) => item.collection == "movie");
  let tvList = userMovieAndTvList.filter((item) => item.collection == "tv");
  showUserlist("movie", movieList);
  showUserlist("tv", tvList);
}

function removeFromList(id) {
  document.getElementById(id).remove();
  userMovieAndTvList = userMovieAndTvList.filter((item) => item.id != id);
  localStorage.setItem("userMovieAndTvList", JSON.stringify(userMovieAndTvList));
}

function showAlert() {
  const alert = document.getElementById("alert");
  alert.classList.add("open");
  setTimeout(() => {
    alert.classList.remove("open");
  }, 3000);
}
