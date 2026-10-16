'use strict';

var FUNNEL_VERSION = 'quiz_v2_emotional_6q_2026_10_16';
var PAGE_OPENED_AT = Date.now();

function trackGA(eventName, params) {
  try {
    if (typeof window.gtag === 'function') {
      var payload = Object.assign({
        funnel_version: FUNNEL_VERSION
      }, params || {});
      window.gtag('event', eventName, payload);
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

function secondsSince(timestamp) {
  if (!timestamp) return 0;
  return Math.max(0, Math.round((Date.now() - timestamp) / 1000));
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

var questionNames = {
  1: 'sonho',
  2: 'interesse',
  3: 'convidados',
  4: 'fase',
  5: 'preocupacao',
  6: 'orcamento'
};

var totalSteps = 6;
var currentStep = 1;
var answers = {};
var answerLabels = {};
var quizCompleted = false;
var quizStarted = false;
var quizStartedAt = null;
var resultShownAt = null;
var abandonSent = false;
var ctaViewSent = false;

function answeredCount() {
  return Object.keys(answers).length;
}

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

  var percent = Math.round((step / totalSteps) * 100);
  var params = {
    step_number: step,
    question_name: questionNames[step] || 'unknown',
    progress_percent: percent,
    answered_count: answeredCount(),
    quiz_elapsed_sec: secondsSince(quizStartedAt)
  };

  // Generic event: ideal para Explorações no GA4.
  trackGA('quiz_step_view', params);
  // Evento individual: ideal para bater o olho em Relatórios > Eventos.
  trackGA('quiz_view_step_' + step, params);

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
  resultShownAt = Date.now();

  buildResultCopy();
  resultWhatsapp.href = buildWhatsAppUrl();

  quizSection.classList.add('hidden');
  resultSection.classList.remove('hidden');

  var completeParams = {
    answered_count: answeredCount(),
    quiz_duration_sec: secondsSince(quizStartedAt),
    sonho: answers.sonho || 'unknown',
    interesse: answers.interesse || 'unknown',
    convidados: answers.convidados || 'unknown',
    fase: answers.fase || 'unknown',
    preocupacao: answers.preocupacao || 'unknown',
    orcamento: answers.orcamento || 'unknown'
  };

  trackGA('quiz_complete', completeParams);
  trackGA('result_view', completeParams);

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
    quizStarted = true;
    quizStartedAt = Date.now();
    resultShownAt = null;
    abandonSent = false;
    ctaViewSent = false;
    currentStep = 1;
    answers = {};
    answerLabels = {};

    trackGA('quiz_start', {
      quiz_name: 'diagnostico_projeto_sim',
      seconds_before_start: secondsSince(PAGE_OPENED_AT)
    });
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
    var percent = Math.round((step / totalSteps) * 100);

    answers[question] = value;
    answerLabels[question] = label;

    var answerParams = {
      step_number: step,
      question_name: question,
      answer_value: value,
      progress_percent: percent,
      answered_count: answeredCount(),
      quiz_elapsed_sec: secondsSince(quizStartedAt),
      quiz_name: 'diagnostico_projeto_sim'
    };

    // Evento genérico com todos os parâmetros.
    trackGA('quiz_answer', answerParams);
    // Eventos individuais para enxergar instantaneamente onde há queda.
    trackGA('quiz_step_' + step, answerParams);

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
    if (currentStep > 1) {
      trackGA('quiz_back_click', {
        from_step: currentStep,
        to_step: currentStep - 1,
        answered_count: answeredCount(),
        quiz_elapsed_sec: secondsSince(quizStartedAt)
      });
      showStep(currentStep - 1);
    }
  });
}

// Mede quem realmente chegou a VER o CTA final, não apenas quem concluiu o quiz.
if (resultWhatsapp && 'IntersectionObserver' in window) {
  var ctaObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting || ctaViewSent || !quizCompleted) return;
      ctaViewSent = true;
      trackGA('whatsapp_cta_view', {
        answered_count: answeredCount(),
        quiz_duration_sec: secondsSince(quizStartedAt),
        seconds_on_result: secondsSince(resultShownAt)
      });
      ctaObserver.disconnect();
    });
  }, { threshold: 0.5 });
  ctaObserver.observe(resultWhatsapp);
}

// O evento padrão Contact da Meta continua disparando SOMENTE no clique final do WhatsApp.
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
      answered_count: answeredCount(),
      quiz_duration_sec: secondsSince(quizStartedAt),
      seconds_on_result: secondsSince(resultShownAt),
      sonho: answers.sonho || 'unknown',
      interesse: answers.interesse || 'unknown',
      convidados: answers.convidados || 'unknown',
      fase: answers.fase || 'unknown',
      preocupacao: answers.preocupacao || 'unknown',
      orcamento: answers.orcamento || 'unknown'
    });
  });
});

// Tempo de permanência: ajuda a separar clique acidental de visita interessada.
[10, 30, 60].forEach(function (seconds) {
  window.setTimeout(function () {
    trackGA('engaged_' + seconds + 's', {
      quiz_started: quizStarted,
      quiz_completed: quizCompleted,
      current_step: quizStarted ? currentStep : 0,
      answered_count: answeredCount()
    });
  }, seconds * 1000);
});

// Se ficou 15 s na landing sem iniciar, isso aponta fricção na promessa/CTA inicial.
window.setTimeout(function () {
  if (!quizStarted) {
    trackGA('quiz_not_started_15s', {
      seconds_on_page: 15
    });
  }
}, 15000);

// Scroll da landing, antes do quiz começar.
var scrollMilestonesSent = {};
function trackLandingScroll() {
  if (quizStarted) return;
  var doc = document.documentElement;
  var scrollTop = window.pageYOffset || doc.scrollTop || 0;
  var viewport = window.innerHeight || doc.clientHeight || 0;
  var fullHeight = Math.max(doc.scrollHeight, document.body ? document.body.scrollHeight : 0);
  if (!fullHeight) return;
  var progress = Math.round(((scrollTop + viewport) / fullHeight) * 100);

  [25, 50, 75, 90].forEach(function (milestone) {
    if (progress >= milestone && !scrollMilestonesSent[milestone]) {
      scrollMilestonesSent[milestone] = true;
      trackGA('landing_scroll_' + milestone, {
        scroll_percent: milestone
      });
    }
  });
}
window.addEventListener('scroll', trackLandingScroll, { passive: true });
trackLandingScroll();

// Registra o ponto de abandono quando a pessoa sai/recarrega a página.
function trackExitPoint() {
  if (quizStarted && !quizCompleted && !abandonSent) {
    abandonSent = true;
    trackGA('quiz_abandon', {
      current_step: currentStep,
      question_name: questionNames[currentStep] || 'unknown',
      answered_count: answeredCount(),
      quiz_elapsed_sec: secondsSince(quizStartedAt),
      transport_type: 'beacon'
    });
  } else if (!quizStarted) {
    trackGA('landing_exit_without_quiz', {
      seconds_on_page: secondsSince(PAGE_OPENED_AT),
      transport_type: 'beacon'
    });
  }
}
window.addEventListener('pagehide', trackExitPoint);
