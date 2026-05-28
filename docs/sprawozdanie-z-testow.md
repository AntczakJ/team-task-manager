# Sprawozdanie z testów

## 1. Zakres i metodyka

Projekt pokryto **testami jednostkowymi** w dwóch warstwach:

- **Backend** - framework **Jest** z `ts-jest` (kod aplikacji i testów w TypeScript, ESM). Testowane są kluczowe funkcje: walidacja danych wejściowych, logika autoryzacji (dostęp tylko właściciela) oraz uwierzytelnianie. Dostęp do bazy danych (Prisma) jest mockowany (`jest.unstable_mockModule`), dzięki czemu testy są szybkie, deterministyczne i nie wymagają działającej bazy.
- **Frontend** - **Vitest** + **@testing-library/react** (środowisko `jsdom`, TypeScript natywnie). Testowane jest renderowanie i zachowanie komponentów; warstwa REST API (axios) jest mockowana.

## 2. Uruchomienie testów

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 3. Testy backendu (Jest)

| Plik | Testowany element | Przypadki |
|------|-------------------|-----------|
| `tests/authMiddleware.test.ts` | Middleware JWT | brak nagłówka -> 401; zły schemat -> 401; nieprawidłowy token -> 401; poprawny token -> `next()` i ustawienie `req.user` |
| `tests/authController.test.ts` | Rejestracja i logowanie | brak pól -> 400; istniejący e-mail -> 409; poprawna rejestracja -> 201 + token (bez hasła); błędne dane logowania -> 401; poprawne logowanie -> 200 + token |
| `tests/projectController.test.ts` | Projekty | brak nazwy -> 400; tworzenie z `ownerId`; brak projektu -> 404; cudzy projekt -> 403; właściciel -> 200; usunięcie kaskadowe zadań |
| `tests/taskController.test.ts` | Zadania | brak tytułu/projektu -> 400; brak projektu -> 404; brak uprawnień -> 403; utworzenie -> 201; nieprawidłowy status -> 400; aktualizacja statusu -> 200 |

### Wynik

```
Test Suites: 4 passed, 4 total
Tests:       25 passed, 25 total
```

## 4. Testy frontendu (Vitest + Testing Library)

| Plik | Testowany komponent | Przypadki |
|------|---------------------|-----------|
| `src/tests/AuthForm.test.tsx` | `AuthForm` | domyślnie widoczny formularz logowania; przełączenie na rejestrację pokazuje pole „Imię"; walidacja - brak imienia pokazuje komunikat błędu |
| `src/tests/ProjectTasks.test.tsx` | `ProjectTasks` | render nagłówka i trzech kolumn statusów; komunikat o braku zadań dla pustego projektu |

### Wynik

```
Test Files  2 passed (2)
     Tests  5 passed (5)
```

## 5. Podsumowanie

| Warstwa | Suity | Testy | Status |
|---------|-------|-------|--------|
| Backend (Jest) | 4 | 25 | wszystkie przechodzą |
| Frontend (Vitest) | 2 | 5 | wszystkie przechodzą |
| **Razem** | **6** | **30** | **30/30** |

Testy obejmują najważniejsze ścieżki logiki: uwierzytelnianie, autoryzację dostępu do zasobów, walidację danych wejściowych oraz renderowanie i podstawową interakcję komponentów UI.

## 6. Scenariusz testowy i zrzuty ekranu

Szczegółowy scenariusz testowy (30 przypadków, format tabelaryczny ze specyfikacją środowiska) oraz zrzuty ekranu z przejścia testów znajdują się w katalogu [`docs/testy/`](testy/):

- [`Scenariusz.xlsx`](testy/Scenariusz.xlsx) - scenariusz testowy (ID, opis, warunki wstępne, kroki, wynik oczekiwany i rzeczywisty, typ i priorytet testu),
- `backend_testy_jest.png` - zrzut ekranu z uruchomienia testów backendu (Jest),
- `frontend_testy_vitest.png` - zrzut ekranu z uruchomienia testów frontendu (Vitest).
