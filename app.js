'use strict';

function trackGA(eventName, params) {
  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params || {});
    }
  } catch (_) {}
}

function trackMetaCustom(eventName, params) {
  try {
    if (typeof window.fbq === 'function') {
      window.fbq('trackCustom', eventName, params || {});
    }
  } catch (_) {}
}

var hero = document.getElementById('hero');
var startQuiz = document.getElementById('startQuiz');
var quizSection = document.getElementById('quizSection');
var resultSection = document.getElementById('resultSection');
var resultWhatsapp = document.getElementById('resultWhatsapp');
var resultTitle = document.getElementById('resultTitle');
var resultText = document.getElementById('resultText');
var backQuestion = document.getElementById('backQuestion');
var progressLabel = document.getElementById('progressLabel');
var progressPercent = document.getElementById('progressPercent');
var progressBar = document.getElementById('progressBar');
var steps = Array.prototype.slice.call(document.querySelectorAll('.quiz-step'));
var answerButtons = Array.prototype.slice.call(document.querySelectorAll('.answer'));

var totalSteps = 6;
var currentStep = 1;
var answers = {};
var answerLabels = {};
var quizCompleted = false;

function scrollToElement(element) {
  if (!element) return;
  try {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (_) {
    element.scrollIntoView();
  }
}

function updateProgress(step) {
  var percent = Math.round((step / totalSteps) * 100);
  progressLabel.textContent = 'Pergunta ' + step + ' de ' + totalSteps;
  progressPercent.textContent = percent + '%';
  progressBar.style.width = percent + '%';
}

function showStep(step) {
  currentStep = step;
  steps.forEach(function (node) {
    var nodeStep = Number(node.getAttribute('data-step'));
    node.classList.toggle('hidden', nodeStep !== step);
  });
  backQuestion.classList.toggle('hidden', step === 1);
  updateProgress(step);
  scrollToElement(quizSection);
}

function buildResultCopy() {
  var dream = answers.sonho;
  var budget = answers.orcamento;
  var guests = answers.convidados;
  var stage = answers.fase;
  var concern = answers.preocupacao;

  var title = 'Seu casamento pode estar mais perto do que você imagina.';
  var text = 'Pelas suas respostas, organização, definição de prioridades e negociação podem fazer uma diferença importante no valor final do seu casamento.';

  if (dream === 'adiando_dinheiro') {
    title = 'Seu casamento não precisa continuar sendo adiado por causa do dinheiro.';
    text = 'Você já tem o sonho. Agora o próximo passo é transformar esse sonho em decisões mais estratégicas, organizando prioridades e o orçamento antes que os valores pareçam impossíveis.';
  } else if (dream === 'valores_assustam') {
    title = 'Os orçamentos que você viu até agora não precisam definir o seu casamento.';
    text = 'Valores altos assustam, mas planejamento, prioridades claras e negociação podem mudar bastante a forma como você distribui o dinheiro em cada escolha.';
  } else if (dream === 'medo_orcamento') {
    title = 'Você ainda pode retomar o controle antes que o orçamento escape.';
    text = 'O fato de você já estar atenta aos gastos é importante. Agora o foco é revisar prioridades, comparar propostas e tomar decisões com um teto claro.';
  }

  if (budget === 'ate_10') {
    text += ' Como sua meta é ficar em até R$10 mil, cada escolha precisa ter prioridade definida, margem para negociação e acompanhamento de orçamento.';
  } else if (budget === '10_15') {
    text += ' Na faixa de R$10 mil a R$15 mil, uma estratégia bem organizada pode ajudar você a colocar mais dinheiro no que realmente importa e reduzir excessos.';
  } else if (budget === '15_20') {
    text += ' Mesmo com uma faixa maior, organização e negociação ajudam a evitar excessos e permitem investir melhor nas partes do casamento que realmente importam para vocês.';
  } else if (budget === 'indefinido') {
    text += ' Definir um teto antes de fechar mais fornecedores pode evitar que pequenos extras se acumulem sem controle.';
  }

  if (guests === 'mais_70') {
    text += ' Como sua lista passa de 70 convidados, o desafio aumenta e a meta de R$10 mil pode exigir adaptações maiores ou um orçamento diferente.';
  }

  if (stage === 'escapando') {
    text += ' Como você já percebeu o orçamento subindo, revisar prioridades e contratos agora pode ser especialmente importante.';
  }

  if (concern === 'fornecedores') {
    text += ' E como negociação com fornecedores é uma preocupação sua, comparar escopo e negociar condições pode gerar ganhos relevantes.';
  }

  resultTitle.textContent = title;
  resultText.textContent = text;
}

function buildWhatsAppUrl() {
  var message = [
    'Oi! Fiz o diagnóstico do Projeto SIM no Azul 💙',
    '',
    '• Meu momento: ' + (answerLabels.sonho || 'não informado'),
    '• Interesse: ' + (answerLabels.interesse || 'não informado'),
    '• Convidados: ' + (answerLabels.convidados || 'não informado'),
    '• Fase: ' + (answerLabels.fase || 'não informada'),
    '• Maior preocupação: ' + (answerLabels.preocupacao || 'não informada'),
    '• Orçamento desejado: ' + (answerLabels.orcamento || 'não informado'),
    '',
    'Quero receber as informações e entender como o Projeto SIM no Azul pode me ajudar.'
  ].join('\n');

  return 'https://wa.me/5531972368967?text=' + encodeURIComponent(message);
}

function showResult() {
  if (quizCompleted) return;
  quizCompleted = true;

  buildResultCopy();
  resultWhatsapp.href = buildWhatsAppUrl();

  quizSection.classList.add('hidden');
  resultSection.classList.remove('hidden');

  trackGA('quiz_complete', {
    sonho: answers.sonho || 'unknown',
    interesse: answers.interesse || 'unknown',
    convidados: answers.convidados || 'unknown',
    fase: answers.fase || 'unknown',
    preocupacao: answers.preocupacao || 'unknown',
    orcamento: answers.orcamento || 'unknown'
  });

  trackMetaCustom('QuizComplete', {
    content_name: 'Diagnostico Projeto SIM'
  });

  scrollToElement(resultSection);
}

if (startQuiz) {
  startQuiz.addEventListener('click', function (event) {
    if (!event.isTrusted) return;

    hero.classList.add('hidden');
    quizSection.classList.remove('hidden');
    resultSection.classList.add('hidden');
    quizCompleted = false;
    currentStep = 1;
    answers = {};
    answerLabels = {};

    trackGA('quiz_start', { quiz_name: 'diagnostico_projeto_sim' });
    trackMetaCustom('QuizStart', { content_name: 'Diagnostico Projeto SIM' });
    showStep(1);
  });
}

answerButtons.forEach(function (button) {
  button.addEventListener('click', function (event) {
    if (!event.isTrusted) return;

    var question = button.getAttribute('data-question');
    var value = button.getAttribute('data-value');
    var label = button.getAttribute('data-label');
    var stepNode = button.closest('.quiz-step');
    var step = stepNode ? Number(stepNode.getAttribute('data-step')) : currentStep;

    answers[question] = value;
    answerLabels[question] = label;

    trackGA('quiz_step_' + step, {
      question: question,
      answer: value,
      quiz_name: 'diagnostico_projeto_sim'
    });

    button.classList.add('selected');

    window.setTimeout(function () {
      button.classList.remove('selected');
      if (step < totalSteps) {
        showStep(step + 1);
      } else {
        showResult();
      }
    }, 160);
  });
});

if (backQuestion) {
  backQuestion.addEventListener('click', function (event) {
    if (!event.isTrusted) return;
    if (currentStep > 1) showStep(currentStep - 1);
  });
}

// The standard Meta Contact event is intentionally fired ONLY after the quiz,
// when the visitor clicks the final WhatsApp CTA.
document.querySelectorAll('[data-whatsapp]').forEach(function (link) {
  link.addEventListener('click', function (event) {
    if (!event.isTrusted) return;
    if (!quizCompleted) {
      event.preventDefault();
      return;
    }

    var position = link.getAttribute('data-cta-position') || 'quiz_result';

    try {
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Contact', {
          content_name: 'WhatsApp Projeto SIM - Quiz concluido',
          contact_method: 'whatsapp'
        });
      }
    } catch (_) {}

    trackGA('whatsapp_click', {
      cta_position: position,
      quiz_completed: true,
      sonho: answers.sonho || 'unknown',
      interesse: answers.interesse || 'unknown',
      convidados: answers.convidados || 'unknown',
      fase: answers.fase || 'unknown',
      preocupacao: answers.preocupacao || 'unknown',
      orcamento: answers.orcamento || 'unknown'
    });
  });
});

window.setTimeout(function () {
  trackGA('engaged_10s', { page_location: window.location.href });
}, 10000);

var scroll50Sent = false;
function maybeTrackScroll50() {
  if (scroll50Sent) return;
  var doc = document.documentElement;
  var scrollTop = window.pageYOffset || doc.scrollTop || 0;
  var viewport = window.innerHeight || doc.clientHeight || 0;
  var fullHeight = Math.max(doc.scrollHeight, document.body ? document.body.scrollHeight : 0);
  if (!fullHeight) return;
  var progress = (scrollTop + viewport) / fullHeight;
  if (progress >= 0.5) {
    scroll50Sent = true;
    trackGA('scroll_50', { page_location: window.location.href });
    window.removeEventListener('scroll', maybeTrackScroll50);
  }
}
window.addEventListener('scroll', maybeTrackScroll50, { passive: true });
maybeTrackScroll50();
