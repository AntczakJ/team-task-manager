# Team Task Manager

## Opis projektu

**Team Task Manager** to full-stackowa aplikacja webowa służąca do zarządzania zadaniami zespołowymi.
Aplikacja umożliwia tworzenie projektów, dodawanie zadań, zmianę ich statusów oraz organizację pracy zespołu w przejrzysty sposób.

Projekt został wykonany w ramach przedmiotu **Programowanie Aplikacji Webowych**.

**Autorzy:** Jan Antczak, Bogdan Seredziński — klasa 4C.

---

## Funkcjonalności

* rejestracja i logowanie użytkowników (JWT)
* tworzenie i usuwanie projektów
* dodawanie, edycja i usuwanie zadań
* zmiana statusu zadań (*Do zrobienia*, *W toku*, *Zrobione*)
* przypisywanie zadań do użytkowników
* komunikacja frontend–backend za pomocą REST API

---

## Architektura aplikacji

Aplikacja posiada rozdzielony frontend i backend:

### Backend (`backend/`)
* Node.js + TypeScript (uruchamiany przez `tsx`) + Express 5, REST API
* baza danych MySQL / MariaDB przez Prisma ORM (adapter `@prisma/adapter-mariadb`)
* uwierzytelnianie JWT, hashowanie haseł `bcryptjs`
* testy jednostkowe (Jest)

### Frontend (`frontend/`)
* React 19 + TypeScript + Vite
* komunikacja z backendem przez REST API (axios)
* responsywny interfejs (Desktop i Mobile) – Tailwind CSS
* testy jednostkowe komponentów (Vitest + Testing Library)

---

## Dokumentacja

* [Dokumentacja projektu](docs/dokumentacja-projektu.md) – autorzy, jak to działa, jak uruchomić, jak korzystać, podział pracy
* [Baza danych](docs/baza-danych.md) – opis tabel i diagram ER
* [Sprawozdanie z testów](docs/sprawozdanie-z-testow.md)

---

## Uruchomienie

### Wariant A: Docker (zalecane)

Wymaga zainstalowanego Dockera. Z katalogu głównego:

```bash
docker compose up --build
```

Uruchamia trzy kontenery: bazę MariaDB, backend (z automatyczną migracją bazy) oraz frontend.

* Frontend: http://localhost:8080
* Backend (API): http://localhost:3000

Załadowanie danych początkowych (fixtures):

```bash
docker compose exec backend npm run db:seed
```

### Wariant B: lokalnie

Wymaga Node.js 22+ oraz działającej bazy MySQL / MariaDB.

**Backend:**

```bash
cd backend
cp .env.example .env      # uzupełnij dane dostępowe do bazy
npm install
npm run db:deploy         # zastosuj migracje
npm run db:seed           # (opcjonalnie) dane początkowe
npm run dev               # serwer na http://localhost:3000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev               # aplikacja na http://localhost:5173
```

---

## Jak korzystać

1. Otwórz aplikację w przeglądarce (`http://localhost:8080` dla Dockera lub `http://localhost:5173` lokalnie).
2. Zarejestruj się lub zaloguj na istniejące konto.
3. Utwórz projekt (nazwa, opcjonalny opis) w sekcji „Utwórz nowy projekt".
4. Kliknij kafelek projektu, aby rozwinąć zarządzanie jego zadaniami.
5. Dodawaj zadania i zmieniaj ich status: *Do zrobienia -> W toku -> Zrobione*; zadania możesz też usuwać.
6. Projekt usuniesz przyciskiem „Usuń" (kasuje też jego zadania); „Wyloguj się" kończy sesję.

---

## Testy

```bash
# Backend (Jest)
cd backend && npm test

# Frontend (Vitest)
cd frontend && npm test
```

Aktualnie: **30 testów** (25 backend + 5 frontend). Szczegóły w [sprawozdaniu z testów](docs/sprawozdanie-z-testow.md).

---

## Dane logowania (po załadowaniu seeda)

* e-mail: `demo@example.com`
* hasło: `haslo123`

---

## Technologie

* TypeScript (Node.js, React)
* Express 5, REST API
* Prisma ORM + MySQL / MariaDB
* Vite, Tailwind CSS
* Jest, Vitest, Testing Library
* Docker / docker-compose
* Git / GitHub
