const {VK} = require('vk-io');
const {Keyboard} = require('vk-io');
const vk = new VK();
const {updates} = vk;
const {api} = vk;
const cheerio = require('cheerio')
const request = require('request')
const Intl = require('intl')
const google = require('google')
const webshot = require('webshot')
const gm = require('gm')
const fs = require('fs')
var moment = require('moment');
moment().format();

const TOKEN = "9e95f643f84f4f92ebffe153eaf266de5702538e3b82b9028cd0e477820be927a3759863f0dd31bc22f46"

vk.setOptions({
	token: TOKEN,
	pollingGroupId: 168462227,
	peer_id: 2000000001
})

//Cоздаем сервер
require('https').createServer().listen(process.env.PORT || 5000).on('request', function(request, res){
	res.end('')
});




api.baseUrl = 'https://api.vk.com/method/'
updates.startPolling()

//Обработчик сообщений и клавиатуры
updates.use(async (context, next) => {
	if (context.is('message')) {
		const { messagePayload } = context;

		context.state.command = messagePayload && messagePayload.command
			? messagePayload.command
			: null;
	}

	await next();
});

const hearCommand = (name, conditions, handle) => {
	if (typeof handle !== 'function') {
		handle = conditions;
		conditions = [`/${name}`];
	}

	if (!Array.isArray(conditions)) {
		conditions = [conditions];
	}

	updates.hear(
		[
			(text, { state }) => (
				state.command === name
			),
			...conditions
		],
		handle
	);
};


//Команды
vk.updates.hear('/start', async(context) => {
	context.send({
		message: `Привет! 
Я - Бот, созданный специально для НАЗВАНИЕ_ВАШЕГО_ЗАВЕДЕНИЯ. К черту эту прелюдию, я могу еще долго распинаться, но вот мой список команд:
/дз - ДОМАШКА
/урок - оповещает тебя, какой сейчас урок
/уроки - получи расписание на сегодняшний день
/игры - не знаю зачем, но у меня есть игры 
/гдз - гугли гдз и я постараюсь прислать его тебе
/insert - добавляй в бота домашку, если ты его знаешь, а другие - нет
/insert ? - справка по команде /insert
/дата - узнай дз на конкретный день
/отзыв - напиши отзыв, и ВАШЕ_ИМЯ его увидит. ВАЖНО: отзыв анонимен
/завтра - узнаешь расписание на завтрашний день
/неделя - расписание на всю неделю
/рожа - шутки
/citgen - еще одни шутки, пересылаете чье-то сообщение и пишите эту команду
/help - моя документация`})
})


hearCommand('игры', async (context) => {
	await context.send({
		message: 'Вот список моих игр',
		keyboard: Keyboard.keyboard([
			[
				Keyboard.textButton({
				label: 'Шар Вероятностей',
				payload: {
					command: 'ball'
				},
				color: Keyboard.POSITIVE_COLOR
			}),
                Keyboard.textButton({
				label: 'Что-то еще...',
				payload: {
					command: 'else'
				},
				color: Keyboard.POSITIVE_COLOR
			})],
                Keyboard.textButton({
				label: 'Закрыть клавиатуру',
				payload: {
					command: 'cancel'
				},
				color: Keyboard.NEGATIVE_COLOR
			})
		],
		{
			oneTime: true
		})
	});
})

hearCommand('ball', async(context) => {
	await context.send('Как играть в эту игру? Очень просто! Ты пишешь "шанc" и свое утверждение, а я отвечаю вероятностью.\nПример:\n- шанc, что Мы - дружный класс\n- Вероятность - 100%') 
	updates.hear(/шанс/i, async(context) => {		
	var chances = new Array(6)		
  chances[0] = "Вероятность близка к нулю :("
  chances[1] = "Я считаю, что 50 на 50"
  chances[2] = "Вероятность - 100%"
  chances[3] = "Я полагаю, что вероятность близка к 100%"
  chances[4] = "Маловероятно, но шанс есть" 
  chances[5] = "Вероятность нулевая, ничего не поделать"
  var m = chances[Math.floor(Math.random() * chances.length)]
	await context.send(m)
})
})

hearCommand('else', async(context) => {
	await context.send('Раз эта кнопка у вас все еще есть, значит я страдаю от острой игровой недостаточности. Если у вас есть идеи, которые может реализовать этот бот в игровой форме - пишите Саше, он сможет :)')
})

hearCommand('cancel', async(context) => {
	await context.send('Хорошо, я выключу клавиатуру!')
})

const Time = new Date()
var Schedule = new Array(6)
Schedule[0] = new Array(6)											
Schedule[0][0] = "1. ПРЕДМЕТ | 🕐 8:30 - 9:10 | 🚪 КАБИНЕТ\n"
Schedule[0][1] = "2. ПРЕДМЕТ | 🕐 9:20 - 10:00 | 🚪 КАБИНЕТ\n"
Schedule[0][2] = "3. ПРЕДМЕТ | 🕐 10:15 - 10:55 | 🚪 КАБИНЕТ\n"
Schedule[0][3] = "4. ПРЕДМЕТ | 🕐 11:15 - 11:55 | 🚪 КАБИНЕТ\n"
Schedule[0][4] = "5. ПРЕДМЕТ | 🕐 12:10 - 12:50 | 🚪 КАБИНЕТ\n"
Schedule[0][5] = "6. ПРЕДМЕТ | 🕐 13:10 - 13:50 | 🚪 КАБИНЕТ\n"

Schedule[1] = new Array(7)
Schedule[1][0] = "1. ПРЕДМЕТ | 🕐 8:30 - 9:10 | 🚪 КАБИНЕТ\n"
Schedule[1][1] = "2. ПРЕДМЕТ | 🕐 9:20 - 10:00 | 🚪 КАБИНЕТ\n"
Schedule[1][2] = "3. ПРЕДМЕТ | 🕐 10:15 - 10:55 | 🚪 КАБИНЕТ\n"
Schedule[1][3] = "4. ПРЕДМЕТ | 🕐 11:15 - 11:55 | 🚪 КАБИНЕТ\n"
Schedule[1][4] = "5. ПРЕДМЕТ | 🕐 12:10 - 12:50 | 🚪 КАБИНЕТ\n"
Schedule[1][5] = "6. ПРЕДМЕТ | 🕐 13:10 - 13:50 | 🚪 КАБИНЕТ\n"
Schedule[1][6] = "7. ПРЕДМЕТ | 🕐 14:10 - 14:50 | 🚪 КАБИНЕТ\n"

Schedule[2] = new Array(7)
Schedule[2][0] = "1. ПРЕДМЕТ | 🕐 8:30 - 9:10 | 🚪 КАБИНЕТ\n"
Schedule[2][1] = "2. ПРЕДМЕТ | 🕐 9:20 - 10:00 | 🚪 КАБИНЕТ\n"
Schedule[2][2] = "3. ПРЕДМЕТ | 🕐 10:15 - 10:55 | 🚪 КАБИНЕТ\n"
Schedule[2][3] = "4. ПРЕДМЕТ | 🕐 11:15 - 11:55 | 🚪 КАБИНЕТ\n"
Schedule[2][4] = "5. ПРЕДМЕТ | 🕐 12:10 - 12:50 | 🚪 КАБИНЕТ\n"
Schedule[2][5] = "6. ПРЕДМЕТ | 🕐 13:10 - 13:50 | 🚪 КАБИНЕТ\n"
Schedule[2][6] = "7. ПРЕДМЕТ | 🕐 14:10 - 14:50 | 🚪 КАБИНЕТ\n"

Schedule[3] = new Array(6)
Schedule[3][0] = "1. СОН | 🕐 До 9:20 \n"
Schedule[3][1] = "2. ПРЕДМЕТ | 🕐 9:20 - 10:00 | 🚪 КАБИНЕТ\n"
Schedule[3][2] = "3. ПРЕДМЕТ | 🕐 10:15 - 10:55 | 🚪 КАБИНЕТ\n"
Schedule[3][3] = "4. ПРЕДМЕТ | 🕐 11:15 - 11:55 | 🚪 КАБИНЕТ\n"
Schedule[3][4] = "5. ПРЕДМЕТ | 🕐 12:10 - 12:50 | 🚪 КАБИНЕТ\n"
Schedule[3][5] = "6. ПРЕДМЕТ | 🕐 13:10 - 13:50 | 🚪 КАБИНЕТ\n"


Schedule[4] = new Array(6)
Schedule[4][0] = "1. ПРЕДМЕТ | 🕐 8:30 - 9:10 | 🚪 КАБИНЕТ\n"
Schedule[4][1] = "2. ПРЕДМЕТ | 🕐 9:20 - 10:00 | 🚪 КАБИНЕТ\n"
Schedule[4][2] = "3. ПРЕДМЕТ | 🕐 10:15 - 10:55 | 🚪 КАБИНЕТ\n"
Schedule[4][3] = "4. ПРЕДМЕТ | 🕐 11:15 - 11:55 | 🚪 КАБИНЕТ\n"
Schedule[4][4] = "5. ПРЕДМЕТ | 🕐 12:10 - 12:50 | 🚪 КАБИНЕТ\n"
Schedule[4][5] = "6. ПРЕДМЕТ | 🕐 13:10 - 13:50 | 🚪 КАБИНЕТ\n"

Schedule[5] = new Array(6)
Schedule[5][0] = "1. ПРЕДМЕТ | 🕐 8:30 - 9:10 | 🚪 КАБИНЕТ\n"
Schedule[5][1] = "2. ПРЕДМЕТ | 🕐 9:20 - 10:00 | 🚪 КАБИНЕТ\n"
Schedule[5][2] = "3. ПРЕДМЕТ | 🕐 10:15 - 10:55 | 🚪 КАБИНЕТ\n"
Schedule[5][3] = "4. ПРЕДМЕТ | 🕐 11:15 - 11:55 | 🚪 КАБИНЕТ\n"
Schedule[5][4] = "5. ПРЕДМЕТ | 🕐 12:10 - 12:50 | 🚪 КАБИНЕТ\n"
Schedule[5][5] = "6. ПРЕДМЕТ | 🕐 13:10 - 13:50 | 🚪 КАБИНЕТ\n"


updates.hear('/завтра', async(context) => {
	
	for(i = 0; i < 7; i++) {
		if(moment().day() === i) {
			await context.send(`Расписание на завтра: \n ${Schedule[i].join(' ')}`)
		}
	}
})

/* Убрать комментарий, когда начнется новый учебный год
let greeting = new Array(4)
greeting[0] = "Итак, мои дорогие, начался новый учебный день. Я желаю вам всем хороших оценок по всем предметам, удачи :)\n Расписание на сегодня:\n"
greeting[1] = "И снова всем приветик, господа. Скучали? Я знаю, что нет. Вот вам расписание на сегодня: \n"
greeting[2] = "Шалом, дамы и пацаны. Возможно, мои ежедневные напоминая о расписании вам надоели, но я ничего поделать не могу - я создан для выполнения конкретных задач. Кстати, вот сегодняшнее расписание: \n"
greeting[3] = "Привет. Без лишних слов. Расписание на сегодня:\n"
var random_greeting = greeting[Math.floor(Math.random() * greeting.length)]
if(moment().hour() === 7 && moment().minute() === 40) {
	for(i = 1; i < 7; i++) {
		if(moment().day() === i) {
			api.messages.send({
				message: random_greeting + Schedule[i-1],
				peer_id: 2000000001
			})
		}
	}
}*/

updates.hear('/урок', async(context) => {
	for(j = 1; j < 7; j++) {
		//Первый урок
		for(i = 30; i < 59; i++)
		{
			if(moment().hour() === 8 && moment().day() === j && moment().minute() === i && Schedule[j-1][0] != undefined) 
			{
				context.send('В данный момент проходит ' + Schedule[j-1][0])
			}
			break
		}
		for(i = 0; i < 10; i++)
		{
			if(moment().hour() === 8 && moment().day() === j && moment().minute() === i && Schedule[j-1][0] != undefined) 
			{	
				context.send('В данный момент проходит ' + Schedule[j-1][0])
			}
			break
		}

		//Второй урок
		for(i = 20; i < 59; i++)
		{
			if(moment().hour() === 9 && moment().day() === j && moment().minute() === i && Schedule[j-1][1] != undefined) 
			{
				context.send('В данный момент проходит ' + Schedule[j-1][1])
			}
			break
		}
		while(i = 0)
		{
			if(moment().hour() === 9 && moment().day() === j && moment().minute() === i && Schedule[j-1][1] != undefined) 
			{
				context.send('В данный момент проходит ' + Schedule[j-1][1])
			}
			break
		}


		//Третий урок
		for(i = 15; i < 55; i++)
		{
			if(moment().hour() === 10 && moment().day() === j && moment().minute() === i && Schedule[j-1][2] != undefined) 
			{
				context.send('В данный момент проходит ' + Schedule[j-1][2])
			}
			break
		}


		//Четвертый урок
		for(i = 15; i < 55; i++)
		{
			if(moment().hour() === 11 && moment().day() === j && moment().minute() === i && Schedule[j-1][3] != undefined) 
			{
				context.send('В данный момент проходит ' + Schedule[j-1][3])
			}
			break
		}


		//Пятый урок
		for(i = 10; i < 50; i++)
		{
			if(moment().hour() === 12 && moment().day() === j && moment().minute() === i && Schedule[j-1][4] != undefined) 
			{
				context.send('В данный момент проходит ' + Schedule[j-1][4])
			}
			break
		}


		//Шестой урок
		for(i = 10; i < 50; i++)
		{
			if(moment().hour() === 13 && moment().day() === j && moment().minute() === i && Schedule[j-1][5] != undefined) 
			{
				context.send('В данный момент проходит ' + Schedule[j-1][5])
			}
			break
		}


		//Седьмой урок
		for(i = 10; i < 50; i++)
		{
			if(moment().hour() === 14 && moment().day() === j && moment().minute() === i && Schedule[j-1][6] != undefined) 
			{
				context.send('В данный момент проходит ' + Schedule[j-1][6])
			}
			break
		}
	}
})


updates.hear('/уроки', async(context) => {
	for(i = 1; i < 7; i++) {
		if(moment().day() === i) {
			await context.send('Расписание на сегодня:\n' + Schedule[i-1].join(' '))
		}
	}
})


const url = 'https://github.com/FloydReme/bot631/blob/master/domashka.txt'
request(url, async function(error, res, body) {
	const $ = cheerio.load(body)
	const Englishdz = $('#LC2').text()
	const Russiandz = $('#LC4').text()
	const Literaturedz=  $('#LC6').text()
	const Germandz = $('#LC8').text()
	const Frenchdz = $('#LC10').text()
	const Algebradz = $('#LC12').text()
	const Geometrydz = $('#LC14').text()
	const Biologydz = $('#LC16').text()
	const Physicsdz = $('#LC20').text()
	const Chemistrydz = $('#LC18').text()
	const CompSciencedz= $('#LC22').text()
	const Geographydz = $('#LC24').text()
	const Mhkdz = $('#LC26').text()
	const History_dz = $('#LC28').text()
	const Societydz = $('#LC30').text()
	const OBJdz = $('#LC32').text()
	const DPUAlgebra = $('#LC34').text()

	const predmeti = new Array(16)
	predmeti[0] = $('#LC1').text() //English
	predmeti[1] = $('#LC3').text() //Russian
	predmeti[2] = $('#LC5').text() //Literature
	predmeti[3] = $('#LC7').text() //German
	predmeti[4] = $('#LC9').text() //French
	predmeti[5] = $('#LC11').text() //Algebra
	predmeti[6] = $('#LC13').text() //Geometry
	predmeti[7] = $('#LC15').text() //Biology
	predmeti[8] = $('#LC17').text() //Сhemistry
	predmeti[9] = $('#LC19').text() //Physics
	predmeti[10] = $('#LC21').text() //СompScience
	predmeti[11] = $('#LC23').text() //Geography
	predmeti[12] = $('#LC25').text() //Mhk
	predmeti[13] = $('#LC27').text() //History
	predmeti[14] = $('#LC29').text() //Society
	predmeti[15] = $('#LC31').text() // OBJ
	predmeti[16] = $('#LC33').text() // ДПУ Алгебра
	

	const Monday = new Array(4)
	Monday[0] = predmeti[13] + History_dz
	Monday[1] = predmeti[1] + Russiandz
	Monday[2] = predmeti[8] + Chemistrydz
	Monday[3] = predmeti[0] + Englishdz

	const Tuesday = new Array(5)
	Tuesday[0] = predmeti[2] + Literaturedz
	Tuesday[1] = predmeti[7] + Biologydz
	Tuesday[2] = predmeti[1] + Russiandz
	Tuesday[3] = predmeti[14] + Societydz
	Tuesday[4] = predmeti[5] + Algebradz

	const Wednesday = new Array(5)
	Wednesday[0] = predmeti[6] + Geometrydz
	Wednesday[1] = predmeti[0] + Englishdz
	Wednesday[2] = predmeti[12] + Mhkdz
	Wednesday[3] = predmeti[9] + Physicsdz
	Wednesday[4] = predmeti[4] + Frenchdz

	const Thursday = new Array(5)
	Thursday[0] = predmeti[9] + Physicsdz
	Thursday[1] = predmeti[10] + CompSciencedz
	Thursday[2] = predmeti[5] + Algebradz
	Thursday[3] = predmeti[13] + History_dz
	Thursday[4] = predmeti[16] + DPUAlgebra

	const Friday = new Array(3)
	Friday[0] = predmeti[11] + Geographydz
	Friday[1] = predmeti[2] + Literaturedz
	Friday[2] = predmeti[0] + Englishdz

	const Saturday = new Array(5)
	Saturday[0] = predmeti[6] + Geometrydz
	Saturday[1] = predmeti[14] + Societydz
	Saturday[2] = predmeti[15] + OBJdz
	Saturday[3] = predmeti[4] + Frenchdz
	
	const preds = new Array(17)
	preds[0] = {
		namesubj: predmeti[0],
		dz: Englishdz 
	}
	preds[1] = {
		namesubj: predmeti[1],
		dz: Russiandz
	}
	preds[2] = {
		namesubj: predmeti[2],
		dz: Literaturedz 
	}
	preds[3] = {
		namesubj: predmeti[3],
		dz: Germandz
	}
	preds[4] = {
		namesubj: predmeti[4],
		dz: Frenchdz
	}
	preds[5] = {
		namesubj: predmeti[5],
		dz: Algebradz
	}
	preds[6] = {
		namesubj: predmeti[6],
		dz: Geometrydz
	}
	preds[7] = {
		namesubj: predmeti[7],
		dz: Biologydz 
	}
	preds[8] = {
		namesubj: predmeti[8],
		dz: Chemistrydz
	}
	preds[9] = {
		namesubj: predmeti[9],
		dz: Physicsdz
	}
	preds[10] = {
		namesubj: predmeti[10],
		dz: CompSciencedz 
	}
	preds[11] = {
		namesubj: predmeti[11],
		dz: Geographydz 
	}
	preds[12] = {
		namesubj: predmeti[12],
		dz: Mhkdz
	}
	preds[13] = {
		namesubj: predmeti[13],
		dz: History_dz 
	}
	preds[14] = {
		namesubj: predmeti[14],
		dz: Societydz
	}
	preds[15] = {
		namesubj: predmeti[15],
		dz: OBJdz 
	}
	preds[16] = {
		namesubj: predmeti[16],
		dz: DPUAlgebra
	}


	const Sunday = new Array(17)
	Sunday[0] = predmeti[0] + preds[0].dz
	Sunday[1] = predmeti[1] + preds[1].dz
	Sunday[2] = predmeti[2] + preds[2].dz
	Sunday[3] = predmeti[13] + preds[13].dz
	Sunday[4] = predmeti[10] + preds[10].dz
	Sunday[5] = predmeti[7] + preds[7].dz
	Sunday[6] = predmeti[5] + preds[5].dz
	Sunday[7] = predmeti[11] + preds[11].dz
	Sunday[8] = predmeti[6] + preds[6].dz
	Sunday[9] = predmeti[14] + preds[14].dz
	Sunday[10] = predmeti[9] + preds[9].dz
	Sunday[11] = predmeti[8]+ preds[8].dz
	Sunday[12] = predmeti[12] + preds[12].dz
	Sunday[13] = predmeti[4] + preds[4].dz
	Sunday[14] = predmeti[3] + preds[3].dz
	Sunday[15] = predmeti[15] + preds[15].dz
	Sunday[16] = predmeti[16] + preds[16].dz

	const Days = [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday]
	
	

	updates.hear(/^\/insert ([а-я.]+) (.+)/i, async(context) => {
	const Subject = new RegExp(context.$match[1],'i') 
	const homeWork = context.$match[2]
	const subjects = []
	$('td').each(function(i, elem) {
		subjects[i] = $(this).text();
	});

	//Прохожусь по всем тегам td и нахожу, есть ли там регулярка с каким-нибудь предметом, если да, то выполняю следующее:
	//Прохожусь по массиву предметов и нахожу, есть ли там совпадение с найденным предметом среди них, то делаю следующее:
	//Нахожу нужный объект с предметом и вставляю homework в dz.
	for(var j = 0; j < subjects.length; j++)
	{
		if(subjects[j].match(Subject))
		{
			for(var i = 0; i < predmeti.length; i++)
			{
				if(predmeti[i] === subjects[j])
				{
					for (var g = 0; g  < preds.length; g++)
					{
						if(predmeti[i] === preds[g].namesubj)
						{
							preds[g].dz = homeWork
							await context.send(`ВАЖНО: Главный список по команде /дз останется старым.
📌 НОВОЕ ДЗ: ${preds[g].namesubj + homeWork} 📌`) 
						}
					}	
				}
			}
		}
	}
	})

	const asks = new Array(2)
	asks[0] = new RegExp(/задано/i)
	asks[1] = new RegExp(/задали/i)
	updates.hear(asks, async(context) => {
	await context.send({
		message: 'Я тут увидел, что кто-то из вас спрашивает ДЗ. Выберите, какой день вам нужен:',
		keyboard: Keyboard.keyboard([
			[
				Keyboard.textButton({
				label: `Понедельник`,
				payload: {
					command: 'monday'
				},
				color: Keyboard.POSITIVE_COLOR
			}),
                Keyboard.textButton({
				label: `Вторник`,
				payload: {
					command: 'tuesday'
				},
				color: Keyboard.POSITIVE_COLOR,
			}), 
			    Keyboard.textButton({
				label: `Среда`,
				payload: {
					command: 'wednesday'
				},
				color: Keyboard.POSITIVE_COLOR
			})],
			[
				Keyboard.textButton({
					label: `Четверг`,
					payload: {
						command: 'thursday'
					},
					color: Keyboard.POSITIVE_COLOR}),
				Keyboard.textButton({
					label: `Пятница`,
					payload: {
						command: 'friday'
					},
					color: Keyboard.POSITIVE_COLOR}),
				Keyboard.textButton({
					label: `Суббота`,
					payload: {
						command: 'saturday'
					},
					color: Keyboard.POSITIVE_COLOR})
				],
                Keyboard.textButton({
				label: `Закрыть клавиатуру`,
				payload: {
					command: 'cancel'
				},
				color: Keyboard.NEGATIVE_COLOR
			})
		],
		{
			oneTime: true
		})
	})

	})

	updates.hear('/дата', async(context) => {
	await context.send({
		message: 'Выберите, какой день вам нужен:',
		keyboard: Keyboard.keyboard([
			[
				Keyboard.textButton({
				label: `Понедельник`,
				payload: {
					command: 'monday'
				},
				color: Keyboard.POSITIVE_COLOR
			}),
                Keyboard.textButton({
				label: `Вторник`,
				payload: {
					command: 'tuesday'
				},
				color: Keyboard.POSITIVE_COLOR,
			}), 
			    Keyboard.textButton({
				label: `Среда`,
				payload: {
					command: 'wednesday'
				},
				color: Keyboard.POSITIVE_COLOR
			})],
			[
				Keyboard.textButton({
					label: `Четверг`,
					payload: {
						command: 'thursday'
					},
					color: Keyboard.POSITIVE_COLOR}),
				Keyboard.textButton({
					label: `Пятница`,
					payload: {
						command: 'friday'
					},
					color: Keyboard.POSITIVE_COLOR}),
				Keyboard.textButton({
					label: `Суббота`,
					payload: {
						command: 'saturday'
					},
					color: Keyboard.POSITIVE_COLOR})
				],
                Keyboard.textButton({
				label: `Закрыть клавиатуру`,
				payload: {
					command: 'cancel'
				},
				color: Keyboard.NEGATIVE_COLOR
			})
		],
		{
			oneTime: true
		})
	})

	})

	hearCommand('monday', async(context) => {
	await context.send(`
	Итак, вот домашка на понедельник
${Monday.join('\n')}`)
	})

	hearCommand('tuesday', async(context) => {
	await context.send(`
	Итак, вот домашка на вторник 
${Tuesday.join('\n')}`)
	})

	hearCommand('wednesday', async(context) => {
	await context.send(`
	Итак, вот домашка на среду 
${Wednesday.join('\n')}`)
	})

	hearCommand('thursday', async(context) => {
	await context.send(`
	Итак, вот домашка на четверг
${Thursday.join('\n')}`)
	})

	hearCommand('friday', async(context) => {
	await context.send(`
	Итак, вот домашка на пятницу
${Friday.join('\n')}`)
	})

	hearCommand('saturday', async(context) => {
	await context.send(`
	Итак, вот домашка на субботу 
${Saturday.join('\n')}`)
	})


	updates.hear(/^\/понедельник/i, async(context) => {
	context.send(`Господа, кто-то из вас не может выучить мои команды. Мне жаль, но я вас могу понять, поэтому держите 
домашку на понедельник:
${Monday.join('\n')}`)
	})

	updates.hear(/^\/вторник/i, async(context) => {
	context.send(`Господа, кто-то из вас не может выучить мои команды. Мне жаль, но я вас могу понять, поэтому держите 
домашку на вторник:
${Tuesday.join('\n')}`)
	})

	updates.hear(/^\/среда/i, async(context) => {
	context.send(`Господа, кто-то из вас не может выучить мои команды. Мне жаль, но я вас могу понять, поэтому держите 
домашку на среду:
${Wednesday.join('\n')}`)
	})

	updates.hear(/^\/четверг/i, async(context) => {
	context.send(`Господа, кто-то из вас не может выучить мои команды. Мне жаль, но я вас могу понять, поэтому держите 
домашку на четверг:
${Thursday.join('\n')}`)
	})

	updates.hear(/^\/пятница/i, async(context) => {
	context.send(`Господа, кто-то из вас не может выучить мои команды. Мне жаль, но я вас могу понять, поэтому держите 
домашку на пятницу:
${Friday.join('\n')}`)
	})

	updates.hear(/^\/суббота/i, async(context) => {
	context.send(`Господа, кто-то из вас не может выучить мои команды. Мне жаль, но я вас могу понять, поэтому держите 
домашку на cубботу:
${Saturday.join('\n')}`)
	})


	updates.hear('/insert ?', async(context) => {
	await context.send(`
Справка по команде /insert.
Она позволяет добавлять домашнее задание для каждого предмета моментально (На самом деле Саша не хочет все вводить вручную, процесс нужно автоматизировать)
Итак, как она работает?
Вы пишите: /insert название_предмета сама_домашка
Затем бот отправит вам обновленное дз по вашему предмету, и все будут счастливы!
Всем мир`)
	})

	updates.hear('/дз все', async(context) =>{
		await context.send(Sunday.join('\n'))
	})

updates.hear('/дз', async(context) => {
	if(Time.getDay() === 1)
	{
		var formatter = new Intl.DateTimeFormat("ru", {
			month: "long",
			day: "numeric"
		  });
		const x = Monday.join('\n')
		await context.send('Домашка с понедельника ' + formatter.format(Time) + ' \n'  + x)
	}
	if(Time.getDay() === 2)
	{
		var formatter = new Intl.DateTimeFormat("ru", {
			month: "long",
			day: "numeric"
		  });
		const x = Tuesday.join('\n')
		await context.send('Домашка со вторника '+ formatter.format(Time) + ' \n'  + x)
	}
	if(Time.getDay() === 3)
	{
		var formatter = new Intl.DateTimeFormat("ru", {
			month: "long",
			day: "numeric"
		  });
		const x = Wednesday.join('\n')
		await context.send('Домашка со среды '+ formatter.format(Time) + ' \n'  + x)
	}
	if(Time.getDay() === 4)
	{
		var formatter = new Intl.DateTimeFormat("ru", {
			month: "long",
			day: "numeric"
		  });
		const x = Thursday.join('\n')
		await context.send('Домашка с четверга '+ formatter.format(Time) + ' \n' + x)
	}
	if(Time.getDay() === 5)
	{
		var formatter = new Intl.DateTimeFormat("ru", {
			month: "long",
			day: "numeric"
		  });
		const x = Friday.join('\n')
		await context.send('Домашка с пятницы '+ formatter.format(Time) + ' \n'  + x)
	}
	if(Time.getDay() === 6)
	{
		var formatter = new Intl.DateTimeFormat("ru", {
			month: "long",
			day: "numeric"
		  });
		const x = Saturday.join('\n')
		await context.send('Домашка с субботы ' + formatter.format(Time) + ' \n' + x)
	}
	if(Time.getDay() === 0)
	{
		var formatter = new Intl.DateTimeFormat("ru", {
			month: "long",
			day: "numeric"
		  });
		const x = Sunday.join('\n')
		await context.send('Поздравляю с единственным выходным. Проведите его с пользой. Домашка на всю неделю: ' + formatter.format(Time) + ' \n'  + x)
	}})
updates.hear('/дз завтра', async(context) => {
	if(Time.getDay() === 1)
	{
		var formatter = new Intl.DateTimeFormat("ru", {
			month: "long",
			day: "numeric"
		  });
		const x = Tuesday.join('\n')
		await context.send('Домашка на завтра. Сегодня ' + formatter.format(Time) + ' \n'  + x)
	}
	if(Time.getDay() === 2)
	{
		var formatter = new Intl.DateTimeFormat("ru", {
			month: "long",
			day: "numeric"
		  });
		const x = Wednesday.join('\n')
		await context.send('Домашка на завтра. Сегодня '+ formatter.format(Time) + ' \n'  + x)
	}
	if(Time.getDay() === 3)
	{
		var formatter = new Intl.DateTimeFormat("ru", {
			month: "long",
			day: "numeric"
		  });
		const x = Thursday.join('\n')
		await context.send('Домашка на завтра. Сегодня '+ formatter.format(Time) + ' \n'  + x)
	}
	if(Time.getDay() === 4)
	{
		var formatter = new Intl.DateTimeFormat("ru", {
			month: "long",
			day: "numeric"
		  });
		const x = Friday.join('\n')
		await context.send('Домашка на завтра. Сегодня '+ formatter.format(Time) + ' \n' + x)
	}
	if(Time.getDay() === 5)
	{
		var formatter = new Intl.DateTimeFormat("ru", {
			month: "long",
			day: "numeric"
		  });
		const x = Saturday.join('\n')
		await context.send('Домашка на завтра. Сегодня '+ formatter.format(Time) + ' \n'  + x)
	}
	if(Time.getDay() === 6)
	{
		var formatter = new Intl.DateTimeFormat("ru", {
			month: "long",
			day: "numeric"
		  });
		const x = Sunday.join('\n')
		await context.send(x)
	}
	if(Time.getDay() === 0)
	{
		var formatter = new Intl.DateTimeFormat("ru", {
			month: "long",
			day: "numeric"
		  });
		const x = Monday.join('\n')
		await context.send('Домашка на завтра. Сегодня '+ formatter.format(Time) + ' \n'  + x)
}})	
})



updates.hear('/help', async(context) => {
	await context.send(`Итак, вот вам более-менее краткая документация.
Мой исходный код: 
	
Краткая сводка по моим командам: /start

Ответы на те или иные сообщения вызваны регулярными выражениями. Как это работает? Просто! 
Я делаю триггер на то или иное слово, а бот на него отвечает.

КАК РАБОТАЕТ /гдз:
Вы пишите команду "/гдз" и следом текст задачи. Пример:
/гдз Из двух городов одновременно на встречу друг другу отправились два поезда. 

Со временем команды будут увеличиваться, если вы об этом меня попросите и если в этом будет вообще всякий смысл`)
})

updates.hear(/^\/гдз (.+)/i, async (context) => {
	const textUser = context.$match[1];
	google.resultsPerPage = 3;
	context.send('Я нашел тут пару ГДЗ по твоему запросу, глянь их:')
	google(textUser, function (error,res) {
    const settings = {
	    streamType: 'png',
		windowSize: {
			width: '1000',
			height: '1400'
		},
		shotSize: {
			width: '1000',
			height: '1400'
		},
		userAgent: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_2 like Mac OS X; en-us)' + ' AppleWebKit/531.21.20 (KHTML, like Gecko) Mobile/7B298g'
		}

		const link1 = res.links[0]
    const link2 = res.links[1]
    const link3 = res.links[2]
		
		Promise.all([
		webshot(link1.href, 'images/GDZ1.png', settings, function() 
		{
			context.send('ГДЗ номер 1:\n' + link1.href)
			context.sendPhoto('images/GDZ1.png')
		}),
		webshot(link2.href, 'images/GDZ2.png', settings, function() 
		{
			context.send('ГДЗ номер 2:\n' + link2.href) 
			context.sendPhoto('images/GDZ2.png')
		}),
		webshot(link3.href, 'images/GDZ3.png', settings, function() 
		{
			context.send('ГДЗ номер 3:\n' + link3.href)
			context.sendPhoto('images/GDZ3.png')
		})
		])
	})
})


updates.hear(/^\/отзыв (.+)/i, async(context) => {
	const feedback = context.$match[1]
	await context.send('Хорошо, твой отзыв будет отправлен Саше, спасибо :)')
	api.messages.send({
		message: 'НОВЫЙ ОТЗЫВ: ' + feedback,
		domain: 'YOUR_DOMAIN'
	})
})


updates.hear('/неделя', async(context) => {
	await context.send(`РАСПИСАНИЕ НА ВСЮ НЕДЕЛЮ:
ПОНЕДЕЛЬНИК:
${Schedule[0].join(' ')}

ВТОРНИК:
${Schedule[1].join(' ')}

СРЕДА:
${Schedule[2].join(' ')}

ЧЕТВЕРГ:
${Schedule[3].join(' ')}

ПЯТНИЦА:
${Schedule[4].join(' ')}

СУББОТА:
${Schedule[5].join(' ')}`)
})



const rozhi = new Array(45)
rozhi[0] = 'photo-168462227_456239034'
rozhi[1] = 'photo-168462227_456239035'
rozhi[2] = 'photo-168462227_456239036'
rozhi[3] = 'photo-168462227_456239037'
rozhi[4] = 'photo-168462227_456239038'
rozhi[5] = 'photo-168462227_456239039'
rozhi[6] = 'photo-168462227_456239040'
rozhi[7] = 'photo-168462227_456239041'
rozhi[8] = 'photo-168462227_456239042'
rozhi[9] = 'photo-168462227_456239043'
rozhi[10] = 'photo-168462227_456239044'
rozhi[11] = 'photo-168462227_456239045'
rozhi[12] = 'photo-168462227_456239046'
rozhi[13] = 'photo-168462227_456239047'
rozhi[14] = 'photo-168462227_456239048'
rozhi[15] = 'photo-168462227_456239049'
rozhi[16] = 'photo-168462227_456239050'
rozhi[17] = 'photo-168462227_456239051'
rozhi[18] = 'photo-168462227_456239052'
rozhi[19] = 'photo-168462227_456239053'
rozhi[20] = 'photo-168462227_456239054'
rozhi[21] = 'photo-168462227_456239055'
rozhi[22] = 'photo-168462227_456239056'
rozhi[23] = 'photo-168462227_456239057'
rozhi[24] = 'photo-168462227_456239058'
rozhi[25] = 'photo-168462227_456239059'
rozhi[26] = 'photo-168462227_456239060'
rozhi[27] = 'photo-168462227_456239061'
rozhi[28] = 'photo-168462227_456239062'
rozhi[29] = 'photo-168462227_456239063'
rozhi[30] = 'photo-168462227_456239064'
rozhi[31] = 'photo-168462227_456239065'
rozhi[32] = 'photo-168462227_456239066'
rozhi[33] = 'photo-168462227_456239067'
rozhi[34] = 'photo-168462227_456239068'
rozhi[35] = 'photo-168462227_456239069'
rozhi[36] = 'photo-168462227_456239070'
rozhi[37] = 'photo-168462227_456239071'
rozhi[38] = 'photo-168462227_456239072'
rozhi[39] = 'photo-168462227_456239073'
rozhi[40] = 'photo-168462227_456239074'
rozhi[41] = 'photo-168462227_456239075'
rozhi[42] = 'photo-168462227_456239076'
rozhi[43] = 'photo-168462227_456239077'
rozhi[44] = 'photo-168462227_456239078'

updates.on('message', async(context,next) => {
	if((context.isInbox || context.isOutbox) && context.text === '/рожа' )
	{
		await context.send({
			message: 'Cколько лиц ты хочешь получить, мой юный извращенец?',
			keyboard: Keyboard.keyboard([
					[
						Keyboard.textButton({
						label: `1`,
						payload: {
							command: 'one'
						},
						color: Keyboard.POSITIVE_COLOR
					}),
						Keyboard.textButton({
						label: `2`,
						payload: {
							command: 'two'
						},
						color: Keyboard.POSITIVE_COLOR,
					}), 
						Keyboard.textButton({
						label: `3`,
						payload: {
							command: 'three'
						},
						color: Keyboard.POSITIVE_COLOR
					})],
					[
						Keyboard.textButton({
							label: `4`,
							payload: {
								command: 'four'
							},
							color: Keyboard.POSITIVE_COLOR}),
						Keyboard.textButton({
							label: `5`,
							payload: {
								command: 'five'
							},
							color: Keyboard.POSITIVE_COLOR}),
						Keyboard.textButton({
							label: `10`,
							payload: {
								command: 'ten'
							},
							color: Keyboard.POSITIVE_COLOR})
						],
						Keyboard.textButton({
						label: `Закрыть клавиатуру`,
						payload: {
							command: 'cancel'
						},
						color: Keyboard.NEGATIVE_COLOR
					})
				],
			{
				oneTime: true
			})
		})

		hearCommand('one', async(context) => {
			await context.send({
				attachment: rozhi[Math.floor(Math.random() * rozhi.length)]
			})
		})
		hearCommand('two', async(context) => {
			await context.send({
				attachment: `${rozhi[Math.floor(Math.random() * rozhi.length)]},${rozhi[Math.floor(Math.random() * rozhi.length)]}`
			})
		})
		hearCommand('three', async(context) => {
			await context.send({
				attachment: `${rozhi[Math.floor(Math.random() * rozhi.length)]},${rozhi[Math.floor(Math.random() * rozhi.length)]},${rozhi[Math.floor(Math.random() * rozhi.length)]}`
			})
		})
		hearCommand('four', async(context) => {
			await context.send({
				attachment:`${rozhi[Math.floor(Math.random() * rozhi.length)]},${rozhi[Math.floor(Math.random() * rozhi.length)]},${rozhi[Math.floor(Math.random() * rozhi.length)]},${rozhi[Math.floor(Math.random() * rozhi.length)]}`
			})
		})
		hearCommand('five', async(context) => {
			await context.send({
				attachment: `${rozhi[Math.floor(Math.random() * rozhi.length)]},${rozhi[Math.floor(Math.random() * rozhi.length)]},${rozhi[Math.floor(Math.random() * rozhi.length)]},${rozhi[Math.floor(Math.random() * rozhi.length)]},${rozhi[Math.floor(Math.random() * rozhi.length)]}`
			})
		})
		hearCommand('ten', async(context) => {
			await context.send({
				attachment: `${rozhi[Math.floor(Math.random() * rozhi.length)]},${rozhi[Math.floor(Math.random() * rozhi.length)]},${rozhi[Math.floor(Math.random() * rozhi.length)]},${rozhi[Math.floor(Math.random() * rozhi.length)]},${rozhi[Math.floor(Math.random() * rozhi.length)]},${rozhi[Math.floor(Math.random() * rozhi.length)]},${rozhi[Math.floor(Math.random() * rozhi.length)]},${rozhi[Math.floor(Math.random() * rozhi.length)]},${rozhi[Math.floor(Math.random() * rozhi.length)]},${rozhi[Math.floor(Math.random() * rozhi.length)]}`
			})
		})
	}
	else
	{
		await next()
		return 
	}
})


updates.hear(/^\/вгулаг (.+)/i, async(context) => {
	const victim = context.$match[1]
	if(context.senderId === 368418604)
	{
		if(isNaN(victim))
		{
			const [user] = await api.users.get({
				user_ids: victim,
				name_case: 'nom'
			});
			await context.send('ГУЛАГ тебя ждет, братишка')
			await context.kickUser(user.id)
		}
		else
		{
			await context.send('ГУЛАГ тебя ждет, братишка')
			await context.kickUser(victim)
		}
	}
	else
	{
		await context.send(`Упс, ошибочка. У вас нет доступа к этой команде`)
	}
})

updates.hear('/citgen', async(context) => {
	await context.send('Citgen accepted')
	var text = []
	if(context.hasForwards)
	{
		imagekek = []

		if(context.forwards.length === 1)
		{
			text[0] = context.forwards[0].text
		}
		for(var i = 0; i < context.forwards.length; i++)
		{
			for(var j = 1; j < context.forwards.length; j++)
			{
				
				if (context.forwards[i].from_id === context.forwards[j].from_id)
				{
					text[i] = context.forwards[i].text
				}
				else {
					text = ''
					await context.send('Так! Ошибка! Рофляночка должна принадлежать одному человеку, а не разным')
					break
				}
			}
			imagekek[i] = await api.users.get({
				user_ids: context.forwards[i].from_id,
				fields: 'photo_100',
				name_case: 'nom'
			})
		}


		var download = function(uri, filename, callback){
			request.head(uri, function(err, res, body){
			  console.log('content-type:', res.headers['content-type']);
			  console.log('content-length:', res.headers['content-length']);
			  request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
			});
		};

		download(imagekek[0][0].photo_100, 'ava.png', function(){
			console.log('done');
		});

		gm(640,400, "#000000")
		.fill('#FFFFFF')
		.drawText(30,42,'Цитаты великих людей').font('HelveticaNeue.ttf',30)
		.drawText(200,200,text.join('\n')).font('HelveticaNeue.ttf',20)
		.drawText(380,370, `© ${imagekek[0][0].first_name} ${imagekek[0][0].last_name}`).fontSize(35)
		.write('rofl.png', async function(err) {
			if(err)
			{
				console.log(err)
			}
			await context.sendPhoto('rofl.png')
			await fs.unlink('rofl.png')
		})
	}
})