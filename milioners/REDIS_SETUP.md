# Konfiguracja Redis dla aplikacji Milionerzy

## Instalacja

Redis został już zainstalowany jako zależność projektu.

## Konfiguracja zmiennych środowiskowych

### Lokalnie (.env.local)

Utwórz plik `.env.local` w katalogu głównym projektu (`milioners/`) z następującą zawartością:

```
REDIS_URL="redis://default:cSdKybTOguu7JwsR9c2Ewq1LVLhjiLUP@redis-19947.c250.eu-central-1-1.ec2.cloud.redislabs.com:19947"
```

### Na Vercel

1. Przejdź do projektu na Vercel
2. Otwórz **Settings** → **Environment Variables**
3. Dodaj nową zmienną:
   - **Name**: `REDIS_URL`
   - **Value**: `redis://default:cSdKybTOguu7JwsR9c2Ewq1LVLhjiLUP@redis-19947.c250.eu-central-1-1.ec2.cloud.redislabs.com:19947`
   - **Environment**: Production, Preview, Development (zaznacz wszystkie)
4. Zapisz zmienne
5. Zredeployuj aplikację

## Jak to działa

- Stan gry jest teraz przechowywany w Redis zamiast w pamięci serwera
- Każda zmiana stanu jest automatycznie zapisywana do Redis
- Głosy publiczności są również przechowywane w Redis
- Jeśli Redis jest niedostępny, aplikacja automatycznie przełącza się na fallback (localStorage + pamięć)

## Bezpieczeństwo

⚠️ **WAŻNE**: Plik `.env.local` jest w `.gitignore` i nie powinien być commitowany do repozytorium.

Na produkcji (Vercel) używaj zmiennych środowiskowych w panelu Vercel.
