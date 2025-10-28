"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Participant {
  id: string
  name: string
  drinks: string[]
  individual_wishes: string
  created_at: string
  updated_at: string
}

export default function ResultsPage() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchParticipants()
  }, [])

  const fetchParticipants = async () => {
    try {
      const response = await fetch('/api/registrations')
      
      if (!response.ok) throw new Error('Failed to fetch registrations')
      
      const data = await response.json()
      setParticipants(data || [])
    } catch (error) {
      console.error("Ошибка при загрузке участников:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getDrinkEmoji = (drink: string) => {
    const emojis: { [key: string]: string } = {
      Шампанское: "🥂",
      Вино: "🍷",
      Виски: "🥃",
      Текила: "🍹",
    }
    return emojis[drink] || "🍸"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <Card className="p-12 bg-card/80 backdrop-blur-sm">
              <p className="text-xl text-muted-foreground">Загрузка результатов...</p>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary font-serif mb-4">Результаты регистрации</h1>
          <p className="text-lg text-muted-foreground">Список участников корпоратива "Проектсервис"</p>
        </div>

        {participants.length === 0 ? (
          <Card className="p-12 text-center bg-card/80 backdrop-blur-sm">
            <p className="text-xl text-muted-foreground">Пока никто не зарегистрировался на мероприятие</p>
            <Link href="/">
              <Button className="mt-6 bg-primary hover:bg-primary/90">Вернуться к приглашению</Button>
            </Link>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 mb-8">
              {participants.map((participant, index) => (
                <Card key={participant.id} className="p-6 bg-card/80 backdrop-blur-sm vintage-glow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-primary">{participant.name}</h3>
                    <span className="text-sm text-muted-foreground">
                      {new Date(participant.created_at).toLocaleDateString("ru-RU", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Предпочитаемые напитки:</h4>
                      <div className="flex flex-wrap gap-2">
                        {participant.drinks && participant.drinks.length > 0 ? (
                          participant.drinks.map((drink, drinkIndex) => (
                            <span
                              key={drinkIndex}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 rounded-full text-sm"
                            >
                              {getDrinkEmoji(drink)} {drink}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground italic">Не указано</span>
                        )}
                      </div>
                    </div>

                    {participant.individual_wishes && (
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Пожелания:</h4>
                        <p className="text-sm text-muted-foreground italic">"{participant.individual_wishes}"</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <p className="text-lg font-semibold text-primary mb-2">
                Всего зарегистрировано: {participants.length} участников
              </p>
              <Link href="/">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                >
                  Вернуться к приглашению
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
