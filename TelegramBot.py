from aiogram import Bot, Dispatcher, types
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, WebAppInfo
from aiogram.filters import Command
from Utils.config import TOKEN, WEB_APP
import asyncio
import logging

BOT_TOKEN = TOKEN
WEB_APP_URL = WEB_APP

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

def get_webapp_button():
    web_app_button = KeyboardButton(
        text="🌐 Открыть WebApp",
        web_app=WebAppInfo(url=WEB_APP_URL)
    )
    keyboard = ReplyKeyboardMarkup(
        keyboard=[[web_app_button]],
        resize_keyboard=True
    )
    return keyboard

@dp.message(Command("start"))
async def start(message: types.Message):
    await message.answer(
        "Привет! Нажми на кнопку ниже, чтобы открыть веб-приложение.",
        reply_markup=get_webapp_button()
    )

async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Бот выключен!")

