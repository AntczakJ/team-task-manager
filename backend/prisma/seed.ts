import 'dotenv/config'
import bcrypt from 'bcryptjs'
import prisma from '../src/utils/prismaClient.js'

async function main(): Promise<void> {
  const password = await bcrypt.hash('haslo123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: { name: 'Demo User', email: 'demo@example.com', password }
  })

  const existing = await prisma.project.findFirst({
    where: { ownerId: user.id, name: 'Przykładowy projekt' }
  })
  if (existing) {
    console.log('Dane początkowe już istnieją - pomijam tworzenie projektu.')
    return
  }

  const project = await prisma.project.create({
    data: {
      name: 'Przykładowy projekt',
      description: 'Projekt demonstracyjny z danymi początkowymi',
      ownerId: user.id,
      tasks: {
        create: [
          { title: 'Zaprojektować bazę danych', status: 'DONE', assigneeId: user.id },
          { title: 'Zaimplementować REST API', status: 'IN_PROGRESS', assigneeId: user.id },
          { title: 'Napisać testy jednostkowe', status: 'TODO' }
        ]
      }
    }
  })

  console.log(
    `Dodano użytkownika ${user.email} (hasło: haslo123) oraz projekt "${project.name}".`
  )
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
