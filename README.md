# Team Task Manager

## Opis projektu

**Team Task Manager** to full-stackowa aplikacja webowa służąca do zarządzania zadaniami zespołowymi.
Aplikacja umożliwia tworzenie projektów, dodawanie zadań, zmianę ich statusów oraz organizację pracy zespołu w przejrzysty sposób.

Projekt został wykonany w ramach przedmiotu **Programowanie Aplikacji Webowych**.

---

## Funkcjonalności

* rejestracja i logowanie użytkowników
* tworzenie i edycja projektów
* dodawanie, edycja i usuwanie zadań
* zmiana statusu zadań (np. *Do wykonania*, *W trakcie*, *Zakończone*)
* komunikacja frontend–backend za pomocą REST API

---

## Architektura aplikacji

Aplikacja posiada rozdzielony frontend i backend:

### Backend

* Node.js
* REST API
* połączenie z bazą danych
* testy jednostkowe kluczowych funkcji

### Frontend

* aplikacja oparta o framework JavaScript
* komunikacja z backendem przez REST API
* responsywny interfejs (Desktop i Mobile)
* testy jednostkowe komponentów

---

## Baza danych

Aplikacja korzysta z bazy danych do przechowywania informacji o:

* użytkownikach
* projektach
* zadaniach

Struktura bazy danych została opisana w dokumentacji projektu wraz z diagramem.

---

## Testy

Projekt zawiera:

* testy jednostkowe backendu
* testy jednostkowe komponentów frontendowych

Testy mają na celu weryfikację poprawności działania kluczowych funkcjonalności aplikacji.

---

## Technologie

* JavaScript / TypeScript
* Node.js
* REST API
* baza danych (relacyjna lub nierelacyjna)
* Git / GitHub

