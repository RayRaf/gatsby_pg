"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"

function GoldenRain() {
  const [particles, setParticles] = useState<
    Array<{
      id: number
      left: number
      size: "small" | "medium" | "large" | "extra-large"
      duration: number
      delay: number
    }>
  >([])

  useEffect(() => {
    const particleCount = 50
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: ["small", "medium", "large", "extra-large"][Math.floor(Math.random() * 4)] as
        | "small"
        | "medium"
        | "large"
        | "extra-large",
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 5,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="golden-rain">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`particle ${particle.size}`}
          style={{
            left: `${particle.left}%`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const targetDate = new Date("2025-12-29T18:00:00").getTime()

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const difference = targetDate - now

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="countdown-timer rounded-lg p-6 mb-8">
      <h3 className="text-xl font-bold text-primary mb-4 text-center">До начала мероприятия:</h3>
      <div className="grid grid-cols-4 gap-4 text-center">
        <div className="countdown-digit rounded-lg p-3">
          <div className="text-2xl font-bold text-primary">{timeLeft.days}</div>
          <div className="text-sm text-muted-foreground">дней</div>
        </div>
        <div className="countdown-digit rounded-lg p-3">
          <div className="text-2xl font-bold text-primary">{timeLeft.hours}</div>
          <div className="text-sm text-muted-foreground">часов</div>
        </div>
        <div className="countdown-digit rounded-lg p-3">
          <div className="text-2xl font-bold text-primary">{timeLeft.minutes}</div>
          <div className="text-sm text-muted-foreground">минут</div>
        </div>
        <div className="countdown-digit rounded-lg p-3">
          <div className="text-2xl font-bold text-primary">{timeLeft.seconds}</div>
          <div className="text-sm text-muted-foreground">секунд</div>
        </div>
      </div>
    </div>
  )
}

function ConfirmationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [name, setName] = useState("")
  const [drinks, setDrinks] = useState({
    champagne: false,
    wine: false,
    whiskey: false,
    tequila: false,
  })
  const [wishes, setWishes] = useState("")
  const [isExistingUser, setIsExistingUser] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [cookieId, setCookieId] = useState("")

  const handleDrinkChange = (drink: keyof typeof drinks) => {
    setDrinks((prev) => ({ ...prev, [drink]: !prev[drink] }))
  }

  const handleSave = async () => {
    if (!name.trim()) return
    setIsLoading(true)

    const selectedDrinks = Object.entries(drinks)
      .filter(([_, selected]) => selected)
      .map(([drink, _]) => {
        const drinkNames: { [key: string]: string } = {
          champagne: "Шампанское",
          wine: "Вино",
          whiskey: "Виски",
          tequila: "Текила",
        }
        return drinkNames[drink]
      })

    try {
      if (isExistingUser) {
        const response = await fetch(`/api/registrations/${cookieId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            drinks: selectedDrinks,
            individual_wishes: wishes.trim(),
          }),
        })

        if (!response.ok) throw new Error('Failed to update registration')
        console.log("Регистрация обновлена")
      } else {
        const response = await fetch('/api/registrations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            drinks: selectedDrinks,
            individual_wishes: wishes.trim(),
            cookie_id: cookieId,
          }),
        })

        if (!response.ok) throw new Error('Failed to create registration')
        console.log("Новая регистрация создана")
      }

      onClose()
    } catch (error) {
      console.error("Ошибка при сохранении:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!isExistingUser) return
    setIsLoading(true)

    try {
      const response = await fetch(`/api/registrations/${cookieId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete registration')

      document.cookie = `gatsby-user-id=; path=/; max-age=0`

      console.log("Регистрация удалена")
      onClose()
    } catch (error) {
      console.error("Ошибка при удалении:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      let userCookieId = document.cookie.split("; ").find((row) => row.startsWith("gatsby-user-id="))

      if (!userCookieId) {
        userCookieId = `gatsby-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        document.cookie = `gatsby-user-id=${userCookieId}; path=/; max-age=${60 * 60 * 24 * 365}` // 1 year
        setCookieId(userCookieId)
      } else {
        const cookieValue = userCookieId.split("=")[1]
        setCookieId(cookieValue)
        checkExistingRegistration(cookieValue)
      }
    }
  }, [isOpen])

  const checkExistingRegistration = async (cookieValue: string) => {
    try {
      const response = await fetch(`/api/registrations/${cookieValue}`)
      
      if (response.ok) {
        const data = await response.json()
        setName(data.name)
        setWishes(data.individual_wishes || "")
        setIsExistingUser(true)

        const drinksObj = {
          champagne: data.drinks?.includes("Шампанское") || false,
          wine: data.drinks?.includes("Вино") || false,
          whiskey: data.drinks?.includes("Виски") || false,
          tequila: data.drinks?.includes("Текила") || false,
        }
        setDrinks(drinksObj)
      }
    } catch (error) {
      console.error("Ошибка при проверке регистрации:", error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg max-w-md w-full vintage-glow max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b border-border">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-primary font-serif">
              {isExistingUser ? "Изменить регистрацию" : "Подтверждение участия"}
            </h2>
            <Button variant="ghost" onClick={onClose} className="text-2xl hover:text-primary">
              ×
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Ваше имя</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите ваше имя"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Предпочитаемые напитки</label>
            <div className="space-y-3">
              {[
                { key: "champagne", label: "🥂 Шампанское", desc: "Игристое вино для торжества" },
                { key: "wine", label: "🍷 Вино", desc: "Красное или белое на ваш выбор" },
                { key: "whiskey", label: "🥃 Виски", desc: "Благородный напиток джентльменов" },
                { key: "tequila", label: "🍹 Текила", desc: "Для любителей экзотики" },
              ].map(({ key, label, desc }) => (
                <div
                  key={key}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-secondary/20 transition-colors"
                >
                  <Checkbox
                    id={key}
                    checked={drinks[key as keyof typeof drinks]}
                    onCheckedChange={() => handleDrinkChange(key as keyof typeof drinks)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor={key} className="text-sm font-medium text-foreground cursor-pointer block">
                      {label}
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Индивидуальные пожелания</label>
            <Textarea
              value={wishes}
              onChange={(e) => setWishes(e.target.value)}
              placeholder="Особые пожелания к мероприятию, диетические ограничения..."
              className="w-full min-h-[80px] resize-none"
            />
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleSave}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold vintage-glow"
              disabled={!name.trim() || isLoading}
            >
              {isLoading ? "Сохранение..." : isExistingUser ? "Обновить пожелания" : "Сохранить"}
            </Button>

            {isExistingUser && (
              <Button onClick={handleDelete} variant="destructive" className="w-full" disabled={isLoading}>
                {isLoading ? "Удаление..." : "Удалить регистрацию"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ImageModal({
  isOpen,
  onClose,
  images,
  currentIndex,
  onNext,
  onPrev,
}: {
  isOpen: boolean
  onClose: () => void
  images: Array<{ src: string; title: string; description: string }>
  currentIndex: number
  onNext: () => void
  onPrev: () => void
}) {
  const currentImage = images[currentIndex]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") onNext()
      if (e.key === "ArrowLeft") onPrev()
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose, onNext, onPrev])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* Close button */}
        <Button
          variant="ghost"
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-primary z-10 text-2xl w-12 h-12 rounded-full bg-black/50 hover:bg-black/70"
        >
          ×
        </Button>

        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              onClick={onPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-primary z-10 text-3xl w-16 h-16 rounded-full bg-black/50 hover:bg-black/70"
            >
              ‹
            </Button>
            <Button
              variant="ghost"
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-primary z-10 text-3xl w-16 h-16 rounded-full bg-black/50 hover:bg-black/70"
            >
              ›
            </Button>
          </>
        )}

        {/* Main image */}
        <div className="relative max-w-5xl max-h-full">
          <img
            src={currentImage.src || "/placeholder.svg"}
            alt={currentImage.title}
            className="max-w-full max-h-full object-contain rounded-lg"
          />

          {/* Image info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-4 rounded-b-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">{currentImage.title}</h3>
              {images.length > 1 && (
                <div className="text-sm text-gray-400">
                  {currentIndex + 1} из {images.length}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DressCodeSection({ onImageClick }: { onImageClick: (index: number) => void }) {
  const dressCodeImages = [
    {
      src: "/dresscode-party-group.png",
      title: "Стиль вечеринки 1920-х",
      description: "Элегантные наряды с золотистыми акцентами, перья и жемчуг",
    },
    {
      src: "/dresscode-women-styles.png",
      title: "Женские образы",
      description: "Платья с бисером, повязки на голову, длинные перчатки",
    },
    {
      src: "/dresscode-flapper-dress-new.jpg",
      title: "Платья флэппер",
      description: "Две элегантные дамы в классических платьях с бахромой и вышивкой",
    },
    {
      src: "/dresscode-men-suits.png",
      title: "Мужские костюмы",
      description: "Смокинги, жилеты, подтяжки и аксессуары",
    },
    {
      src: "/dresscode-men-formal.png",
      title: "Формальная мужская одежда",
      description: "Классические костюмы с бабочками и запонками",
    },
    {
      src: "/dresscode-group-formal.png",
      title: "Групповой образ",
      description: "Примеры сочетания мужских и женских нарядов",
    },
  ]

  return (
    <section className="relative py-20 bg-secondary/10 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold text-primary font-serif mb-4">Примеры нарядов</h3>
          <p className="text-lg text-muted-foreground">Вдохновитесь стилем золотых двадцатых</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dressCodeImages.map((image, index) => (
            <div
              key={index}
              className="group fade-in-up cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => onImageClick(index)}
            >
              <div className="relative overflow-hidden rounded-lg mb-4 vintage-glow bg-secondary/20">
                <img
                  src={image.src || "/placeholder.svg"}
                  alt={image.title}
                  className="w-full h-64 object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div className="text-white">
                    <p className="text-sm font-medium">Нажмите для увеличения</p>
                  </div>
                </div>
              </div>
              <h4 className="text-lg font-semibold text-primary mb-2">{image.title}</h4>
              <p className="text-sm text-muted-foreground">{image.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 p-8 bg-card/80 backdrop-blur-sm rounded-lg vintage-glow">
          <h4 className="text-2xl font-bold text-primary mb-6 text-center">Основные элементы дресс-кода</h4>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h5 className="font-semibold text-primary mb-4">Для дам:</h5>
              <ul className="space-y-2 text-sm">
                <li>• Платья с заниженной талией и бахромой</li>
                <li>• Повязки на голову с перьями или стразами</li>
                <li>• Длинные жемчужные бусы</li>
                <li>• Длинные перчатки</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-primary mb-4">Для мужчин:</h5>
              <ul className="space-y-2 text-sm">
                <li>• Смокинг или костюм-тройка</li>
                <li>• Белая рубашка с воротником-стойкой</li>
                <li>• Бабочка или галстук</li>
                <li>• Подтяжки</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contests Section */}
        <div className="mt-16 p-8 bg-card/90 backdrop-blur-sm rounded-lg vintage-glow">
          <h4 className="text-3xl font-bold text-primary mb-4 text-center">🏆 Конкурсы вечера</h4>
          <p className="text-center text-muted-foreground mb-8">
            Приготовьтесь продемонстрировать свой творческий потенциал и стиль!
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Contest 1 */}
            <Card className="overflow-hidden bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20">
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-yellow-500/20 to-orange-500/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-2">🏢✨</div>
                    <div className="text-xl font-bold text-primary">Лучшее украшение</div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h5 className="text-xl font-bold text-primary mb-3">Конкурс на лучшее украшение кабинета</h5>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Превратите свой кабинет в новогоднюю сказку! Елки, гирлянды, снежинки, 
                  мишура - создайте атмосферу волшебства и праздника. Покажите командный дух и креативность!
                </p>
              </div>
            </Card>

            {/* Contest 2 */}
            <Card className="overflow-hidden bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20">
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-rose-500/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-2">👗🎩</div>
                    <div className="text-xl font-bold text-primary">Лучший образ</div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h5 className="text-xl font-bold text-primary mb-3">Конкурс на лучший образ в стиле Гэтсби</h5>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Воплотите дух ревущих двадцатых! Платья с бахромой, смокинги, перья, жемчуг - 
                  покажите свой неповторимый стиль и элегантность той эпохи.
                </p>
              </div>
            </Card>

            {/* Contest 3 */}
            <Card className="overflow-hidden bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20">
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-teal-500/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-2">🎭🎪</div>
                    <div className="text-xl font-bold text-primary">Лучший номер</div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h5 className="text-xl font-bold text-primary mb-3">Конкурс на лучший номер от отдела</h5>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Подготовьте яркое выступление всем отделом! Танец, сценка, песня или что-то совершенно 
                  уникальное - удивите всех своим талантом и сплоченностью команды!
                </p>
              </div>
            </Card>
          </div>

          <div className="mt-8 text-center p-6 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-lg font-semibold text-primary mb-2">
              🎁 Победителей ждут ценные призы и незабываемые впечатления!
            </p>
            <p className="text-sm text-muted-foreground">
              Не упустите шанс проявить себя и стать звездой вечера
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function GatsbyInvitation() {
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isRegistered, setIsRegistered] = useState(false)
  const [userName, setUserName] = useState("")
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(true)

  const dressCodeImages = [
    {
      src: "/dresscode-party-group.png",
      title: "Стиль вечеринки 1920-х",
      description: "Элегантные наряды с золотистыми акцентами, перья и жемчуг",
    },
    {
      src: "/dresscode-women-styles.png",
      title: "Женские образы",
      description: "Платья с бисером, повязки на голову, длинные перчатки",
    },
    {
      src: "/dresscode-flapper-dress-new.jpg",
      title: "Платья флэппер",
      description: "Две элегантные дамы в классических платьях с бахромой и вышивкой",
    },
    {
      src: "/dresscode-men-suits.png",
      title: "Мужские костюмы",
      description: "Смокинги, жилеты, подтяжки и аксессуары",
    },
    {
      src: "/dresscode-men-formal.png",
      title: "Формальная мужская одежда",
      description: "Классические костюмы с бабочками и запонками",
    },
    {
      src: "/dresscode-group-formal.png",
      title: "Групповой образ",
      description: "Примеры сочетания мужских и женских нарядов",
    },
  ]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % dressCodeImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + dressCodeImages.length) % dressCodeImages.length)
  }

  // Check registration status on mount
  useEffect(() => {
    const checkRegistration = async () => {
      try {
        const userCookie = document.cookie.split("; ").find((row) => row.startsWith("gatsby-user-id="))
        
        if (userCookie) {
          const cookieValue = userCookie.split("=")[1]
          const response = await fetch(`/api/registrations/${cookieValue}`)
          
          if (response.ok) {
            const data = await response.json()
            setIsRegistered(true)
            setUserName(data.name)
          }
        }
      } catch (error) {
        console.error("Ошибка при проверке регистрации:", error)
      } finally {
        setIsCheckingRegistration(false)
      }
    }

    checkRegistration()
  }, [])

  // Handle modal close and recheck registration
  const handleModalClose = () => {
    setIsConfirmationModalOpen(false)
    // Recheck registration after modal closes
    setTimeout(async () => {
      try {
        const userCookie = document.cookie.split("; ").find((row) => row.startsWith("gatsby-user-id="))
        
        if (userCookie) {
          const cookieValue = userCookie.split("=")[1]
          const response = await fetch(`/api/registrations/${cookieValue}`)
          
          if (response.ok) {
            const data = await response.json()
            setIsRegistered(true)
            setUserName(data.name)
          } else {
            setIsRegistered(false)
            setUserName("")
          }
        } else {
          setIsRegistered(false)
          setUserName("")
        }
      } catch (error) {
        console.error("Ошибка при проверке регистрации:", error)
      }
    }, 500)
  }

  // Handle cancellation
  const handleCancelRegistration = async () => {
    if (!confirm("Вы уверены, что хотите отменить регистрацию?")) {
      return
    }

    try {
      const userCookie = document.cookie.split("; ").find((row) => row.startsWith("gatsby-user-id="))
      
      if (userCookie) {
        const cookieValue = userCookie.split("=")[1]
        const response = await fetch(`/api/registrations/${cookieValue}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          document.cookie = `gatsby-user-id=; path=/; max-age=0`
          setIsRegistered(false)
          setUserName("")
          alert("Регистрация успешно отменена")
        } else {
          alert("Ошибка при отмене регистрации")
        }
      }
    } catch (error) {
      console.error("Ошибка при отмене регистрации:", error)
      alert("Ошибка при отмене регистрации")
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <GoldenRain />
      <ConfirmationModal isOpen={isConfirmationModalOpen} onClose={handleModalClose} />
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        images={dressCodeImages}
        currentIndex={currentImageIndex}
        onNext={nextImage}
        onPrev={prevImage}
      />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70 chandelier-enhanced"
          style={{
            backgroundImage: `url('/luxurious-1920s-art-deco-ballroom-with-golden-chan.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background/80" />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <div className="inline-block p-1 art-deco-border rounded-full mb-6">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center vintage-glow">
                <span className="text-3xl font-bold text-primary-foreground">{"★"}</span>
              </div>
            </div>
          </div>

          <div className="mb-6"></div>

          <h4 className="text-3xl md:text-5xl font-bold enhanced-text-shadow text-vibrant-gold font-serif mb-6 illuminated-text">
            ООО &quot;Проектсервис&quot; и ПКФ &quot;Водоканалпроект&quot; приглашают коллег на
          </h4>
          <h2 className="text-4xl md:text-6xl font-light mb-8 gold-gradient-text font-serif neon-flicker-text">
            КОРПОРАТИВ
          </h2>
          <p className="text-xl md:text-2xl text-bright-gold mb-12 font-light pulsing-glow-text">
            Погрузитесь в атмосферу золотых двадцатых
          </p>

          <div className="flex items-center justify-center gap-4 text-sm text-bright-gold pulsing-glow-text">
            <span>{"↓"}</span>
            <span>ПРОКРУТИТЕ ВНИЗ</span>
            <span>{"↓"}</span>
          </div>
        </div>
      </section>

      {/* Era Facts Section 1 */}
      <section className="relative py-20 overflow-x-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: `url('/1920s-jazz-club-interior-with-musicians-and-dancer.jpg')`,
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12 items-center min-h-[80vh]">
          <div className="fade-in-up">
            <Card className="p-8 bg-card/80 backdrop-blur-sm vintage-glow">
              <h3 className="text-3xl font-bold mb-6 text-primary font-serif">Эпоха Джаза</h3>
              <p className="text-lg leading-relaxed mb-4">
                1920-е годы — время невероятного культурного расцвета. Джаз заполнил танцевальные залы, а чарльстон стал
                символом свободы и раскрепощения.
              </p>
              <p className="text-muted-foreground">
                <strong>Факт:</strong> В 1925 году в США работало более 32 000 джаз-клубов, где выступали такие легенды
                как Луи Армстронг и Дюк Эллингтон.
              </p>
            </Card>
          </div>

          <div className="text-center">
            <div className="text-8xl mb-4 sparkle">🎷</div>
            <h4 className="text-2xl font-bold text-primary font-serif">1920</h4>
          </div>
        </div>
      </section>

      {/* Era Facts Section 2 */}
      <section className="relative py-20 overflow-x-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: `url('/luxurious-1920s-casino-with-roulette-tables-and-el.jpg')`,
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12 items-center min-h-[80vh]">
          <div className="text-center order-2 md:order-1">
            <div className="text-8xl mb-4 sparkle">🎰</div>
            <h4 className="text-2xl font-bold text-primary font-serif">Казино</h4>
          </div>

          <div className="fade-in-up order-1 md:order-2">
            <Card className="p-8 bg-card/80 backdrop-blur-sm vintage-glow">
              <h3 className="text-3xl font-bold mb-6 text-primary font-serif">Золотая Лихорадка</h3>
              <p className="text-lg leading-relaxed mb-4">
                Подпольные казино и спикизи процветали во время сухого закона. Азартные игры стали символом роскоши и
                риска.
              </p>
              <p className="text-muted-foreground">
                <strong>Факт:</strong> Знаменитое казино "Cotton Club" в Гарлеме было местом встречи элиты и гангстеров,
                где выступали лучшие джазовые музыканты эпохи.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Dress Code Section */}
      <DressCodeSection
        onImageClick={(index) => {
          setCurrentImageIndex(index)
          setIsImageModalOpen(true)
        }}
      />

      {/* Era Facts Section 3 */}
      <section className="relative py-20 overflow-x-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: `url('/1920s-cabaret-show-with-dancers-in-feathers-and-se.jpg')`,
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center min-h-[80vh]">
          <div className="fade-in-up">
            <div className="mb-8">
              <div className="w-64 h-64 mx-auto mb-6 rounded-full overflow-hidden vintage-glow">
                <img
                  src="/leonardo-dicaprio-as-jay-gatsby-with-champagne-gla.jpg"
                  alt="Приглашение от Гэтсби"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-primary font-serif gatsby-text-shadow">
              Дорогой друг!
            </h2>

            <Card className="p-8 bg-card/90 backdrop-blur-sm vintage-glow max-w-4xl">
              <CountdownTimer />

              <p className="text-xl md:text-2xl leading-relaxed mb-8 font-light">
                Приглашем вас на незабываемый корпоративный вечер в стиле великолепных двадцатых. Окунитесь в атмосферу
                джаза, роскоши и безграничного веселья!
              </p>

              <div className="grid md:grid-cols-3 gap-8 mb-12 text-lg">
                <div>
                  <h4 className="font-bold text-primary mb-2">Дата</h4>
                  <p>29 декабря 2025</p>
                </div>
                <div>
                  <h4 className="font-bold text-primary mb-2">Время</h4>
                  <p>18:00 - 23:00</p>
                </div>
                <div>
                  <h4 className="font-bold text-primary mb-2">Место</h4>
                  <p>
                    Банкетный зал "Арт Холл"
                    <br />
                    г. Уфа, Гостиный двор
                    <br />
                    Верхнеторговая площадь, 1
                  </p>
                </div>
              </div>

              {isCheckingRegistration ? (
                <div className="py-4">
                  <p className="text-muted-foreground">Проверка регистрации...</p>
                </div>
              ) : isRegistered ? (
                <div className="space-y-4">
                  <div className="p-6 bg-primary/10 rounded-lg border-2 border-primary/30 vintage-glow">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <span className="text-3xl">✨</span>
                      <h3 className="text-2xl font-bold text-primary">Поздравляем!</h3>
                      <span className="text-3xl">✨</span>
                    </div>
                    <p className="text-lg font-semibold text-foreground">
                      {userName}, вы зарегистрированы на мероприятие
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      size="lg"
                      onClick={() => setIsConfirmationModalOpen(true)}
                      className="flex-1 text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold vintage-glow"
                    >
                      Изменить пожелания
                    </Button>
                    <Button
                      size="lg"
                      onClick={handleCancelRegistration}
                      variant="destructive"
                      className="flex-1 text-lg px-8 py-6 font-bold"
                    >
                      Отменить регистрацию
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="lg"
                  onClick={() => setIsConfirmationModalOpen(true)}
                  className="text-xl px-12 py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold vintage-glow"
                >
                  Подтвердить участие
                </Button>
              )}

              <p className="mt-8 text-sm text-muted-foreground italic">
                &quot;Она танцевала так, будто мир принадлежал ей одной.&quot; — Зельда Фицджеральд
              </p>

              <div className="mt-12 pt-8 border-t border-border/20"></div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
