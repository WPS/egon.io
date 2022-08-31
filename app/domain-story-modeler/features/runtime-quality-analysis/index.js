// 'use-strict';

/**
 * Get Elements
 */
let elementContainer = document.getElementById('runtimeAnalysisSummaryContainer');
let input__container = document.getElementById('input__container');
let modal_resilience = document.getElementById('modal_resilience');


/**
 * Creates new template view for resilience tests with a unique ID
 * For every new resilience scenario a new template is created
 * @param {} element 
 */
export function createResilienceTemplateView(element) {
    console.log("Testing new method...");
    
    /**
     * Create html elements
     */
    let newRuntimeAnalysisElement = document.createElement('button');
    let resilienceScenarioName = document.createElement('input');
    let resilienceScenarioType = document.createElement('input');
    let resilienceScenarioStart = document.createElement('input');
    let resilienceScenarioEnvironment = document.createElement('input');
    
    /**
     * Create html labels for input fields
     */
    let resilienceScenarioName__label = document.createElement('label');
    let resilienceScenarioType__label = document.createElement('label');
    let resilienceScenarioStart__label = document.createElement('label');
    let resilienceScenarioEnvironment__label = document.createElement('label');
    
    
    /**
     * Adding event listeners
     */
    newRuntimeAnalysisElement.addEventListener('click', () => {
        modal_resilience.style.display = 'block';
    });
    
    /**
     * As the domain-story-modeler does not assign nor create unique IDs in a specific manner,
     * we will use the shape_id of a newly created element on the canvas
     */
    let templateId = element.id;
    
    newRuntimeAnalysisElement.id = element.id;
    newRuntimeAnalysisElement.classList.add(templateId);
    newRuntimeAnalysisElement.innerText = 'Resilience Scenario ' + element.id.toString();
    
    resilienceScenarioName.id = 'resilienceScenarioName';
    resilienceScenarioType.id = 'resilienceScenarioType';
    resilienceScenarioStart.id = 'resilienceScenarioStart';
    resilienceScenarioEnvironment.id = 'resilienceScenarioEnvironment';
    
    resilienceScenarioName.type = 'text';
    resilienceScenarioType.type = 'text';
    resilienceScenarioStart.type = 'text';
    resilienceScenarioEnvironment.type = 'text';
    
    resilienceScenarioName.placeholder = 'Geben Sie dem Szenario einen Namen...';
    resilienceScenarioType.placeholder = 'Geben Sie den Typ an...';
    resilienceScenarioStart.placeholder = 'Geben Sie wann das Szenario beginnen soll...';
    resilienceScenarioEnvironment.placeholder = 'Geben Sie eine Umgebung für das Szenario an...';
    
    resilienceScenarioName__label.innerText = 'Name des Szenarios'
    resilienceScenarioType__label.innerText = 'Typ des Szenarios'
    resilienceScenarioStart__label.innerText = 'Startzeitpunkt des Szenarios'
    resilienceScenarioEnvironment__label.innerText = 'Umgebung des Szenarios'
    
    resilienceScenarioName__label.setAttribute("for", 'resilienceScenarioName');
    resilienceScenarioType__label.setAttribute("for", 'resilienceScenarioType');
    resilienceScenarioStart__label.setAttribute("for", 'resilienceScenarioStart');
    resilienceScenarioEnvironment__label.setAttribute("for", 'resilienceScenarioEnvironment');
    
    /**
     * Appending all child nodes to parent container, i.e., template view
     */
    elementContainer.appendChild(newRuntimeAnalysisElement);
    
    input__container.appendChild(resilienceScenarioName__label);
    input__container.appendChild(resilienceScenarioName);
    input__container.appendChild(resilienceScenarioType__label);
    input__container.appendChild(resilienceScenarioType);
    input__container.appendChild(resilienceScenarioStart__label);
    input__container.appendChild(resilienceScenarioStart);
    input__container.appendChild(resilienceScenarioEnvironment__label);
    input__container.appendChild(resilienceScenarioEnvironment);
    
}

export function test() {
    console.log("Das ist ein Test!!!!!!!!");
}