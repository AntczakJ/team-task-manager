# Dokumentacja projektu - Team Task Manager

## Autorzy

- **Jan Antczak**
- **Bogdan Seredziński**

Klasa **4C**. Projekt wykonany w ramach przedmiotu **Programowanie Aplikacji Webowych**.

## 1. Opis aplikacji

**Team Task Manager** to webowa aplikacja do zarządzania zadaniami zespołowymi z rozdzielonym frontendem i backendem, komunikującymi się przez REST API.

Aplikacja umożliwia:

- rejestrację i logowanie użytkowników (uwierzytelnianie oparte na tokenach JWT),
- tworzenie, przeglądanie i usuwanie projektów,
- dodawanie, edycję i usuwanie zadań w obrębie projektu,
- zmianę statusu zadania w przepływie `Do zrobienia -> W toku -> Zrobione`,
- przypisywanie zadań do użytkowników.

Każdy użytkownik ma dostęp wyłącznie do własnych projektów i zadań - autoryzacja jest egzekwowana po stronie backendu (porównanie `ownerId` projektu z identyfikatorem zalogowanego użytkownika).

### Stos technologiczny

| Warstwa | Technologie |
|---------|-------------|
| Język | TypeScript (frontend i backend) |
| Frontend | React 19 + TypeScript, Vite, Tailwind CSS, axios |
| Backend | Node.js + TypeScript (uruchamiany przez `tsx`), Express 5, REST API |
| Baza danych | MySQL / MariaDB + Prisma ORM (adapter `@prisma/adapter-mariadb`) |
| Uwierzytelnianie | JWT (`jsonwebtoken`), hashowanie haseł `bcryptjs` |
| Testy | Jest + ts-jest (backend), Vitest + Testing Library (frontend) |
| Infrastruktura | Docker, docker-compose |

### Struktura repozytorium

```
team-task-manager/
├── backend/              # API w Express + Prisma (TypeScript)
│   ├── src/
│   │   ├── controllers/    # logika auth / projektów / zadań
│   │   ├── routes/         # definicje tras REST
│   │   ├── middleware/     # weryfikacja tokenu JWT
│   │   └── utils/          # klient Prisma
│   ├── prisma/             # schemat, migracje, seed (dane początkowe)
│   ├── tests/              # testy jednostkowe (Jest)
│   └── Dockerfile
├── frontend/             # aplikacja React + TypeScript (Vite)
│   ├── src/
│   │   ├── components/     # AuthForm, ProjectsList, ProjectTasks
│   │   ├── services/       # klient REST API (axios)
│   │   └── tests/          # testy komponentów (Vitest)
│   └── Dockerfile
├── docs/                 # dokumentacja
│   └── testy/             # scenariusz testowy + zrzuty ekranu
└── docker-compose.yml    # uruchomienie całości w kontenerach
```

## 2. Jak to działa (architektura)

Aplikacja składa się z dwóch niezależnych części komunikujących się przez REST API (format JSON).

**Przepływ żądania:**

1. Frontend (React) wysyła żądanie HTTP do backendu pod `http://localhost:3000/api/...` (klient axios).
2. Express kieruje żądanie do odpowiedniego routera, a trasy chronione przechodzą przez middleware `authMiddleware`, który weryfikuje token JWT z nagłówka `Authorization: Bearer <token>`.
3. Kontroler waliduje dane, sprawdza uprawnienia (czy zasób należy do zalogowanego użytkownika) i wykonuje operacje na bazie przez Prisma ORM.
4. Wynik wraca jako odpowiedź JSON; frontend aktualizuje stan komponentów i interfejs.

**Uwierzytelnianie i autoryzacja:**

- Po rejestracji/logowaniu backend generuje token JWT i zwraca go wraz z danymi użytkownika.
- Frontend zapisuje token w `localStorage` i automatycznie dołącza go do każdego kolejnego żądania (interceptor axios).
- Hasła są hashowane (`bcryptjs`) - w bazie nigdy nie ma haseł w postaci jawnej.
- Dostęp do projektów i zadań jest ograniczony do ich właściciela (`ownerId`).

**Model danych:** User (1 - N) Project (1 - N) Task. Opis tabel i diagram ER znajdują się w pliku [`baza-danych.md`](baza-danych.md).

## 3. Podział pracy

Zespół 2-osobowy:

| Obszar | Osoba |
|--------|-------|
| Backend - API (Express), kontrolery auth/projektów/zadań, routing REST | Jan Antczak |
| Backend - baza danych: schemat Prisma, migracje, połączenie (adapter MariaDB) | Jan Antczak |
| Backend - uwierzytelnianie JWT i autoryzacja dostępu | Jan Antczak |
| Migracja backendu na TypeScript | Jan Antczak |
| Konfiguracja Docker / docker-compose oraz dane początkowe (seed) | Jan Antczak |
| Scenariusz testowy (`docs/testy/Scenariusz.xlsx`) i sprawozdanie z testów | Jan Antczak |
| Dokumentacja projektu i diagram bazy danych | Jan Antczak |
| Frontend - aplikacja React, komponenty (logowanie/rejestracja, lista projektów, zarządzanie zadaniami) | Bogdan Seredziński |
| Frontend - integracja z REST API (axios), obsługa stanu i błędów | Bogdan Seredziński |
| Frontend - stylowanie i responsywność (Tailwind, Desktop/Mobile) | Bogdan Seredziński |
| Migracja frontendu na TypeScript | Bogdan Seredziński |
| Testy jednostkowe - backend (Jest) i frontend (Vitest) | Bogdan Seredziński |

W skrócie: **Jan Antczak** odpowiadał za backend, bazę danych, infrastrukturę i dokumentację (w tym scenariusz testowy), a **Bogdan Seredziński** za frontend i testy jednostkowe.

## 4. Jak uruchomić

### Wariant A: Docker (zalecane, z bazą danych w komplecie)

Wymaga zainstalowanego **Dockera**. Z katalogu głównego projektu:

```bash
docker compose up -d --build
docker compose exec backend npm run db:seed   # opcjonalnie: dane początkowe
```

- Frontend: http://localhost:8080
- Backend (API): http://localhost:3000

Zatrzymanie: `docker compose down` (lub `docker compose down -v`, aby również wyczyścić bazę).

### Wariant B: lokalnie (bez Dockera)

Wymaga **Node.js 22+** oraz działającej bazy **MySQL / MariaDB**.

```bash
# Backend
cd backend
cp .env.example .env       # uzupełnij dane dostępowe do bazy
npm install
npm run db:deploy          # zastosuj migracje
npm run db:seed            # opcjonalnie: dane początkowe
npm run dev                # API na http://localhost:3000

# Frontend (drugi terminal)
cd frontend
npm install
npm run dev                # aplikacja na http://localhost:5173
```

### Uruchomienie na innym komputerze

1. Pobierz kod: `git clone https://github.com/AntczakJ/team-task-manager.git` (lub skopiuj folder projektu bez `node_modules/`).
2. Użyj wariantu A (Docker) - jest samowystarczalny, nie wymaga pliku `.env` (dane bazy są w `docker-compose.yml`).
3. Wymagane wolne porty: `8080`, `3000`, `3306`.

> Plik `backend/.env` z hasłami nie jest częścią repozytorium (jest w `.gitignore`). Wariant lokalny wymaga utworzenia go z `backend/.env.example`.

## 5. Jak korzystać

1. Otwórz aplikację w przeglądarce (`http://localhost:8080` dla Dockera lub `http://localhost:5173` lokalnie).
2. **Zarejestruj się** (imię, e-mail, hasło) lub **zaloguj** na istniejące konto.
3. W sekcji „Utwórz nowy projekt" podaj nazwę (opis opcjonalnie) i kliknij „Dodaj".
4. **Kliknij kafelek projektu**, aby rozwinąć zarządzanie zadaniami.
5. Dodaj zadania (tytuł, opcjonalny opis). Każde zadanie startuje w kolumnie „Do zrobienia".
6. Zmieniaj status zadania (`Do zrobienia -> W toku -> Zrobione`) przyciskami na kafelku zadania; zadania możesz też usuwać.
7. Projekt można usunąć przyciskiem „Usuń" (kasuje też powiązane zadania).
8. „Wyloguj się" kończy sesję (usuwa token z przeglądarki).

Konto demonstracyjne (po załadowaniu danych początkowych): e-mail `demo@example.com`, hasło `haslo123`.

## 6. Baza danych

Opis tabel oraz diagram ER: [`baza-danych.md`](baza-danych.md).

## 7. Testy

Zakres testów, sposób uruchomienia, wyniki oraz scenariusz testowy i zrzuty ekranu: [`sprawozdanie-z-testow.md`](sprawozdanie-z-testow.md).
