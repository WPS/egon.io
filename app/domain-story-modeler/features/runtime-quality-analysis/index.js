// 'use-strict';
import { ResilienceFaultTypeEnum, ResilienceInjectionTypesEnum, ResilienceEnvironmentEnum } from './classes/ResilienceTemplate';
/**
 * Get Elements
 */
let elementContainer = document.getElementById('runtimeAnalysisSummaryContainer');
let input__container = document.getElementById('input__container');
let modal_resilience = document.getElementById('modal_resilience');
let modal_resilience__content = document.getElementById('modal_resilience_content');


/**
 * Creates new template view for resilience tests with a unique ID
 * For every new resilience scenario a new template is created
 * @param {} element 
 */
export function createResilienceTemplateView(element) {

    /**
     * Create html elements
     */
    let resilienceTemplateView__btn__open = document.createElement('button');
    let resilienceTemplateView__btn__close = document.createElement('button');
    let resilienceTemplateView__btn__save = document.createElement('button');

    let resilienceScenarioName = document.createElement('input');
    let resilienceScenarioStart = document.createElement('input');

    let resilienceScenarioFaultTypeSelect = document.createElement('select');
    let resilienceScenarioInjectionTypeSelect = document.createElement('select');
    let resilienceScenarioEnvironmentSelect = document.createElement('select');
    /**
     * Create html labels for input fields
     */
    let resilienceScenarioName__label = document.createElement('label');
    let resilienceScenarioFaultType__label = document.createElement('label');
    let resilienceScenarioInjection__label = document.createElement('label');
    let resilienceScenarioStart__label = document.createElement('label');
    let resilienceScenarioEnvironment__label = document.createElement('label');


    /**
     * Adding event listeners
     */
    resilienceTemplateView__btn__open.addEventListener('click', () => {
        modal_resilience.style.display = 'block';
    });

    resilienceTemplateView__btn__close.addEventListener('click', () => {
        modal_resilience.style.display = 'none';
    })

    /**
     * In here, we create a new resilience template object
     */
    resilienceTemplateView__btn__save.addEventListener('click', () => {
        console.log("Save content...");
    })

    /**
     * Create options for select elements
     */
    for (const [key, value] of Object.entries(ResilienceFaultTypeEnum)) {
        let optionItem = document.createElement('option');
        optionItem.value = key;
        optionItem.text = value;
        resilienceScenarioFaultTypeSelect.appendChild(optionItem);
    }

    for (const [key, value] of Object.entries(ResilienceInjectionTypesEnum)) {
        let optionItem = document.createElement('option');
        optionItem.value = key;
        optionItem.text = value;
        resilienceScenarioInjectionTypeSelect.appendChild(optionItem);
    }

    for (const [key, value] of Object.entries(ResilienceEnvironmentEnum)) {
        let optionItem = document.createElement('option');
        optionItem.value = key;
        optionItem.text = value;
        resilienceScenarioEnvironmentSelect.appendChild(optionItem);
    }

    /**
     * As the domain-story-modeler does not assign nor create unique IDs in a specific manner,
     * we will use the shape_id of a newly created element on the canvas
     */
    let templateId = element.id;

    resilienceTemplateView__btn__open.id = templateId;
    resilienceTemplateView__btn__open.innerText = 'Resilience Szenario ' + templateId.toString();
    elementContainer.appendChild(resilienceTemplateView__btn__open);

    resilienceTemplateView__btn__close.innerText = 'Schließen';
    resilienceTemplateView__btn__save.innerText = 'Speichern';

    resilienceTemplateView__btn__close.classList.add('btn');
    resilienceTemplateView__btn__close.classList.add('btn-secondary');

    resilienceTemplateView__btn__save.classList.add('btn');
    resilienceTemplateView__btn__save.classList.add('btn-primary');

    resilienceTemplateView__btn__open.classList.add('btn');
    resilienceTemplateView__btn__open.classList.add('btn-primary');

    resilienceScenarioFaultTypeSelect.id = 'resilienceScenarioFaultTypeSelect';
    resilienceScenarioInjectionTypeSelect.id = 'resilienceScenarioInjectionTypeSelect';
    resilienceScenarioEnvironmentSelect.id = 'resilienceScenarioEnvironmentTypeSelect';

    resilienceScenarioName.id = 'resilienceScenarioName';
    resilienceScenarioStart.id = 'resilienceScenarioStart';

    resilienceScenarioName.type = 'text';
    resilienceScenarioStart.type = 'text';

    resilienceScenarioName.placeholder = 'Geben Sie dem Szenario einen Namen...';
    resilienceScenarioStart.placeholder = 'Geben Sie wann das Szenario beginnen soll...';

    resilienceScenarioName__label.innerText = 'Name des Szenarios';
    resilienceScenarioStart__label.innerText = 'Startzeitpunkt des Szenarios';
    resilienceScenarioEnvironment__label.innerText = 'Umgebung des Szenarios';
    resilienceScenarioInjection__label.innerText = 'Injection Typ des Szenarios';
    resilienceScenarioFaultType__label.innerText = 'Typ des Fault Loads';

    resilienceScenarioName__label.setAttribute("for", 'resilienceScenarioName');
    resilienceScenarioStart__label.setAttribute("for", 'resilienceScenarioStart');
    resilienceScenarioEnvironment__label.setAttribute("for", 'resilienceScenarioEnvironmentSelect');
    resilienceScenarioInjection__label.setAttribute("for", 'resilienceScenarioInjectionTypeSelect');
    resilienceScenarioFaultType__label.setAttribute("for", 'resilienceScenarioFaultTypeSelect');


    /**
     * Appending all child nodes to parent container, i.e., template view
     */
    modal_resilience__content.appendChild(resilienceTemplateView__btn__close);
    modal_resilience__content.appendChild(resilienceTemplateView__btn__save);

    input__container.appendChild(resilienceScenarioName__label);
    input__container.appendChild(resilienceScenarioName);

    input__container.appendChild(resilienceScenarioInjection__label);
    input__container.appendChild(resilienceScenarioInjectionTypeSelect);

    input__container.appendChild(resilienceScenarioFaultType__label);
    input__container.appendChild(resilienceScenarioFaultTypeSelect);

    input__container.appendChild(resilienceScenarioStart__label);
    input__container.appendChild(resilienceScenarioStart);

    input__container.appendChild(resilienceScenarioEnvironment__label);
    input__container.appendChild(resilienceScenarioEnvironmentSelect);

}

export function test() {
    console.log("Das ist ein Test!!!!!!!!");
}