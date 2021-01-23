import { gql } from 'apollo-server';
import { cypher } from 'neo4j-graphql-js';

export const typeDefs = gql`
  type ClinicalTrial {
    "Information about privately and publicly funded clinical studies conducted around the world."

    """
    ClinicalTrials.gov identifier of the study.
    e.g. NCT04338360 
    """
    NCTId: ID! @id
    
    """
    The source of the information. Hardcoded to 'clinicaltrials.gov' for all nodes.
    """
    data_source: String!

    """
    URL to the study in clinicalTrials.gov ('https://clinicaltrials.gov/ct2/show/' + Id), where Id is the NCTId, e.g. https://www.clinicaltrials.gov/ct2/show/nct00855166
    """
    url: String!
  
    """
    A bibliographic reference in NLM's MEDLINE.    
    A "1 to many" relationship in the magitude of 1-200, e.g. one ClinicalTrial can have one or more Citations. (note: A Citation can referred in many ClinicalTrials)
    """
    refersTo: [Citation] @relation(name: "REFERS_TO", direction: OUT)

    """
    A website directly relevant to the protocol, if applicable. 
    Does not include sites whose primary goal is to advertise or sell commercial products or services. 
    Can include links to educational, research, government, and other non-profit web pages. 
    All links are subject to review by ClinicalTrials.gov

    If exists, then a 1 to 1 relationship between the ClinicalTrial and Link
    """
    refersToUrl: [Link] @relation(name: "REFERS_TO_URL", direction: OUT)
    
    """
    The relationship between a ClinicalTrial and a type of Reference. A ClinicalTrial can use a Reference as either background, result or derived.
    A "1 to 1" relationship
    """
    useReferenceAs: [ReferenceType] @relation(name: "USE_REFERENCE_AS", direction: OUT)

    """
    A ClinicaTrial is conducted at a Facility. This can e.g. be the name of a hospital or clinic.
    A "1 to many" relationship in the magitude of 1-900, e.g. one ClinicalTrial can be conducted at one or more facilities.
    """   
    conductedAt: [Facility] @relation(name: "CONDUCTED_AT", direction: OUT)

    """
    A ClinicalTrial has a purpose of invetigating an (e.g. medication, surgery) 
    A "1 to many" relationship in the magitude of 1-30, e.g. one ClinicalTrial can investigate one or more Interventions.
    """  
    investigates: [Intervention] @relation(name: "INVESTIGATES_INTERVENTION", direction: OUT)

    """
    A CliinicaTrial can be of a certain type: Investigational, Observational or Expanded Access. 
    A 1:1 relationship.
    """
    type: [StudyType] @relation(name: "IS_TYPE", direction: OUT)

    """
    A ClinicalTrial is sponsored (i.e. paid) be someone.
    A 1:1 relationship.
    """
    isSponsoredBy: [Sponsor] @relation(name: "IS_SPONSORED_BY", direction: OUT)

    """
    A ClinicalTrial can be supported by a collaborator. 
    A 1:many relationship, in the magitude of 1-100, e.g. one ClinicalTrial can supported by one or ore collaborators.
    """
    isSupportedBy: [Collaborator] @relation(name: "IS_SUPPORTED_BY", direction: OUT)

    """
    This relationship indicates if the ClinicalTrial studies a U.S. FDA-regulated Device Product (Optional for Observational Studies)
    Indication that a clinical study is studying a device product subject to section 510(k), 515, or 520(m) of the Federal Food, Drug, and Cosmetic Act. Select Yes/No.
    This is a 1:1 relationship.
    """
    isFdaRegulatedDevice: [Response] @relation(name: "IS_FDA_REGULATED_DEVICE", direction: OUT)

    """
    This relationship indicates if the ClinicalTrial investigates a device product Not Approved or Cleared by U.S. FDA *§ (formerly "Delayed Posting")
    Indication that at least one device product studied in the clinical study has not been previously approved or cleared by the U.S. Food and Drug Administration (FDA) for one or more uses. Select one.
      Yes: At least one studied FDA-regulated device product has not been previously approved or cleared by FDA
      No: All studied FDA-regulated device products have been previously approved or cleared by FDA.

    This is a 1:1 relationship.
    """  
    isUnapprovedDevice: [Response] @relation(name: "IS_UNAPPROVED_DEVICE", direction: OUT)

    """
    This relationship indicates if the ClinicalTrial studies a U.S. FDA-regulated Drug Product (Optional for Observational Studies)
    Indication that a clinical study is studying a drug product (including a biological product) subject to section 505 of the Federal Food, Drug, and Cosmetic Act or to section 351 of the Public Health Service Act. Select Yes/No.
    This is a 1:1 relationship.    
    """
    isFdaRegulatedDrug: [Response] @relation(name: "IS_FDA_REGULATED_DRUG", direction: OUT)

    """
    Availability of Expanded Access.
    Whether there is expanded access to the investigational product for patients who do not qualify for enrollment in a clinical trial. 
    Expanded Access for investigational drug products (including biological products) includes all expanded access types under section 561 of the Federal Food, Drug, and Cosmetic Act: 
      (1) for individual participants, including emergency use; 
      (2) for intermediate-size participant populations; and 
      (3) under a treatment IND or treatment protocol. 

    Relationship can be one of the below:
      Yes: Investigational product is available through expanded access
      No: Investigational product is not available through expanded access
      Unknown: If the responsible party is not the sponsor of the clinical trial and manufacturer of the investigational product.
    
    This is a 1:1 relationship.
    """
    expandedAccess: [Response] @relation(name: "HAS_EXPANDED_ACCESS", direction: OUT)

    """
    A Clinical is studying / invetigting a Condition
    A "1 to many" relationship in the magitude of 1-40, e.g. one ClinicalTrial can be studying one or more conditions.
    """
    isStudying: [Condition] @relation(name: "IS_STUDYING", direction: OUT)

    """
    A ClinicalTrial of StudyType: Invetigational can be categorised as one or more phases (typically only one).
    A "1 to many" relationship in the magitude of 1-2, e.g a ClinicalTrial be Phase 1 and Phase 2 (two relationships).
    """
    isPhase: [Phase] @relation(name: "IS_PHASE", direction: OUT)

    """
    A Clinical Trial has a primary purpose for the investigation.
    This is a 1:1 relationship.
    """
    purpose: [Purpose] @relation(name: "HAS_PURPOSE", direction: OUT)

    """
    A ClinicalTrial can have an additional identification assigend by the sponsor.
    This is a 1:1 relationship.
    """
    identifications: [StudyIdentification] @relation(name: "HAS_IDENTIFICATION", direction: OUT)

    """
    A ClinicalTrial can have different recruitment status depending on progress of the study.
    This is a 1:1 relationship.
    """
    status: [Status] @relation(name: "HAS_STATUS", direction: OUT)
 
    """
    A ClinicalTrial can be prematurely stopped.
    If the ClinicalTrial was stopped this is a 1:1 relationship.
    """
    stopped: [StopReason] @relation(name: "WAS_STOPPED", direction: OUT)
 
    """
    A ClinicalTrial has a start date.
    This is a 1:1 relationship.
    """
    started: [Start] @relation(name: "STARTED_AT", direction: OUT)

    """
    A ClinicaTrial has an end date.
    This is a 1:1 relationship.
    """
    completed: [Completed] @relation(name: "COMPLETED_AT", direction: OUT)

    """
    A ClinicalTrial is conducted by an Invetigator.
    This is a 1:1 relationship.
    """
    conductedBy: [Investigator] @relation(name: "IS_CONDUCTED_BY", direction: OUT)

    """
    A ClinicalTrial has a description.
    This is a 1:1 relationship.
    """
    description: [Description] @relation(name: "HAS_DESCRIPTION", direction: OUT)

    """
    A ClinicalTrial has a study design.
    This is a 0:1 relationship. 
    """
    studyDesign: [Design] @relation(name: "HAS_STUDY_DESIGN", direction: OUT)

    """
    For ClinicalTrials of StudyType:Observational a time perspective/observation period can be specified.
    This is a 1:1 relationship. 
    """
    observationPeriod: [ObservationPeriod] @relation(name: "HAS_OBSERVATION_PERIOD", direction: OUT)

    """
    A ClinicalTrial can have a Primary Outcome
    This is a 0:1 relationship. 
    """
    primaryOutcome: [Outcome] @relation(name: "HAS_PRIMARY_OUTCOME", direction: OUT)

    """
    A ClinicalTrial can have one or more Secondary Outcomes
    A 1:many relationship, in the magitude of 1-260, e.g. one ClinicalTrial can have one or more seconday outcome.
    """
    secondaryOutcome: [Outcome] @relation(name: "HAS_SECONDARY_OUTCOME", direction: OUT)

    """
    TA ClinicalTrial can have one or more Other Outcomes
    A 1:many relationship, in the magitude of 1-60, e.g. one ClinicalTrial can have one or more other outcome.
    """
    otherOutcome: [Outcome] @relation(name: "HAS_OTHER_OUTCOME", direction: OUT)

    """
    A ClinicalTrial is investigating intervention on a study population.
    A 1:1 relationship.
    """
    studyPopulation: [StudyPopulation] @relation(name: "HAS_STUDY_POPULATION", direction: OUT)

    """
    A ClinicalTrial can have one or more Inclusion Criteia. The study participant must adhere to the criteria to be included in the study.
    A limited list of criteria for selection of participants in the clinical study, provided in terms of inclusion criteria and suitable for assisting potential participants in identifying clinical studies of interest.
    A 1:many relationship, in the magitude of 1-60, e.g. one ClinicalTrial can have one or more inclusion criteria.
    """
    inclusionCriteria: [InclusionCriteria] @relation(name: "HAS_INCLUSION_CRITERIA", direction: OUT)

    """
    A ClinicalTrial can have one or more Exclusion Criteia. if the study participant meet the criteria the subject is excluded in the study.
    A limited list of criteria for selection of participants in the clinical study, provided in terms of exclusion criteria and suitable for assisting potential participants in identifying clinical studies of interest.
    A 1:many relationship, in the magitude of 1-80, e.g. one ClinicalTrial can have one or more exclusion criteria.
    """
    exclusionCriteria: [ExclusionCriteria] @relation(name: "HAS_EXCLUSION_CRITERIA", direction: OUT)

    """
    The ClinicalTrial must have a contact person.
    A 1:many relationship, in the magitude of 1-5, e.g. one ClinicalTrial can have one or more central contact psersons.
    """
    contactPerson: [Contact] @relation(name: "HAS_CONTACT_PERSON", direction: OUT)

    """
    A Clinical Trial of StudyType Observation or Expanded Access can have samples retained in a bio-repository.
    A 1:1 relationship.
    """
    retainedBioSamples: [BioSpecimen] @relation(name: "HAS_SAMPLES_RETAINED_IN_BIOREPOSITORY", direction: OUT) #//! typo
    
    """
    The ClinicalTrial can be designed to compare arms of treatment.
    A 1:many relationship, in the magitude of 1-30, e.g. one ClinicalTrial can have one or more study arms.
    """
    studyArms: [Arm] @relation(name: "HAS_STUDY_ARMS", direction: OUT)
  }

  type Link {
"A web site directly relevant to the protocol may be entered, if desired. "
    """
    Complete URL, including http:// or https://
    Limit: 3999 characters.
    """
    url: String! @id

    """
    A Link refers to a ClinicalTrial
    If exists, then a 1 to 1 relationship between the Link and the clinical trial.
    """
    trials: [ClinicalTrial] @relation(name: "REFERS_TO_URL", direction: IN)
  }

  type ReferenceType {
"Type of reference/citation used in a clinical trial"

    """
    A ClinicalTrial can use a Reference/citation as either (name): background, result or derived.
    """
    name: String! @id
    
    """
    The relationship between a Citation and a type of Reference.
    A 1:many relationship, in the magitude of 1-3, e.g. one Citation can be of more than one type, since a citation can be referred to from many trials.
    """
    citations: [Citation] @relation(name: "IS_REFERENCE_TYPE", direction: IN)

    """
    A ClinicalTrial can have citations of one or more reference types.
    A 1:many relationship, in the magitude of 1-3, e.g. one ClinicalTrial can have one or more Reference Types.
    """
    trials: [ClinicalTrial] @relation(name: "USE_REFERENCE_AS", direction: IN)
  }

  type Facility {
"Information about facility in a clinical study"
    """
    Full name of the organization where the clinical study is being conducted.
    Limit: 254 characters.
    """
    name: String! @id

    """
    A Facility can conduct one or more ClinicalTrial. 
    A "1 to many" relationship in the magitude of 1-30, e.g. one facility can conduct one or more ClinicalTrials.
    """
    trials: [ClinicalTrial] @relation(name: "CONDUCTED_AT", direction: IN)

    """
    A facility is located in a city.
    A 1:1 relationship
    """
    city: City @relation(name: "LOCATED_IN", direction: OUT)
  }

  type Intervention {
"The intervention(s) associated with each arm or group"
    """
    At least one intervention must be specified for interventional studies. 
    For observational studies, specify the intervention(s)/exposure(s) of interest, if any. 
    If the same intervention is associated with more than one arm or group, provide the information once and use the Arm or Group/Intervention Cross-Reference to associate it with more than one arm or group.

    A brief descriptive name used to refer to the intervention(s) studied in each arm of the clinical study. A non-proprietary name of the intervention must be used, if available. If a non-proprietary name is not available, a brief descriptive name or identifier must be used.
    Limit: 200 characters.
    """
    name: String! @id

    """
    Details that can be made public about the intervention, other than the Intervention Name(s), sufficient to distinguish the intervention from other, similar interventions studied in the same or another clinical study. 
    For example, interventions involving drugs may include dosage form, dosage, frequency, and duration.
    Limit: 1000 characters.

    """
    description: String!

    """
    For each intervention studied in the clinical study, the general type of intervention. 
    One of the below can be selected:
      Drug: Including placebo
      Device: Including sham
      Biological/Vaccine
      Procedure/Surgery
      Radiation
      Behavioral: For example, psychotherapy, lifestyle counseling
      Genetic: Including gene transfer, stem cell and recombinant DNA
      Dietary Supplement: For example, vitamins, minerals
      Combination Product: Combining a drug and device, a biological product and device; a drug and biological product; or a drug, biological product, and device
      Diagnostic Test: For example, imaging, in-vitro
      Other
    """
    type: String!

    """
    A ClinicalTrial has a purpose of invetigating an (e.g. medication, surgery) 
    A "1:1" relationship. An intervention is investigated in one CliniclTrial.
    """
    trials: [ClinicalTrial] @relation(name: "INVESTIGATES_INTERVENTION", direction: IN)
  }

  type StudyType {
"The Type of the ClinicalTrial"
    """
    Interventional (clinical trial): Participants are assigned prospectively to an intervention or interventions according to a protocol to evaluate the effect of the intervention(s) on biomedical or other health related outcomes.
    Observational: Studies in human beings in which biomedical and/or health outcomes are assessed in pre-defined groups of individuals. Participants in the study may receive diagnostic, therapeutic, or other interventions, but the investigator does not assign specific interventions to the study participants. This includes when participants receive interventions as part of routine medical care, and a researcher studies the effect of the intervention.   
    Expanded Access: An investigational drug product (including biological product) available through expanded access for patients who do not qualify for enrollment in a clinical trial. Expanded Access includes all expanded access types under section 561 of the Federal Food, Drug, and Cosmetic Act: (1) for individual patients, including emergency use; (2) for intermediate-size patient populations; and (3) under a treatment IND or treatment protocol. (For more information on data requirements for this Study Type, see Expanded Access Data Element Definitions).
    """
    type: String! @id

    """
    A StudyType: Investigational, Observational or Expanded Access can contain one or more ClinicalTrials.
    A "1 to many" relationship in the magitude of 1-3000, e.g. one StudyType can contain one or more ClinicalTrials.
    """
    trials: [ClinicalTrial] @relation(name: "IS_TYPE", direction: IN)
  }

  type Sponsor {
"The name of the entity or the individual who is the sponsor of the clinical study."
    """
    Limit: 160 characters.
    When a clinical study is conducted under an investigational new drug application (IND) or investigational device exemption (IDE), the IND or IDE holder is considered the sponsor. 
    When a clinical study is not conducted under an IND or IDE, the single person or entity who initiates the study, by preparing and/or planning the study, and who has authority and control over the study, is considered the sponsor.
    """
    name: String! @id

    """
    A sponsor can sponsor one or more ClinicalTrials.
    A "1 to many" relationship in the magitude of 1-90, e.g. one Sponsor can sponsor/conduct one or more ClinicalTrials.
    """
    trials: [ClinicalTrial] @relation(name: "IS_SPONSORED_BY", direction: IN)
  }

  type Collaborator {
"Other organizations (if any) providing support"
    """
    
    Support may include funding, design, implementation, data analysis or reporting. 
    The responsible party is responsible for confirming all collaborators before listing them.
    Limit: 160 characters.
    """
    name: String! @id

    """
    A Collaborator can support one or more ClinicalTrials.
    A "1 to many" relationship in the magitude of 1-30, e.g. one Collaborator can support one or more ClinicalTrials.
    """
    trials: [ClinicalTrial] @relation(name: "IS_SUPPORTED_BY", direction: IN)
  }

  type Response {
"A respons to a Yes/No"
    """
    A Yes/No indicator.
    """
    YN: String! @id

    """
    The response (e.g. Yes) can be the answer to Is FDA Regulated device for one or more Clinical Trials.
    A "1 to many" relationship in the magitude of 1-5000, e.g. for 5000 of the ClinicalTrial the answer to : Is FDA regulated Device? Response: No.

    """
    isFdaRegulatedDevice: [ClinicalTrial] @relation(name: "IS_FDA_REGULATED_DEVICE", direction: IN)

    """
    The response (e.g. Yes) can be the answer to Is Unapproved device for one or more Clinical Trials.
    A "1 to many" relationship in the magitude of 1-5000, e.g. for 5000 of the ClinicalTrial the answer to : Is Is Unapproved device? Response: No.
    """
    isUnapprovedDevice: [ClinicalTrial] @relation(name: "IS_UNAPPROVED_DEVICE", direction: IN)

    """
    The response (e.g. Yes) can be the answer to Is FDA Regulated drug for one or more Clinical Trials.
    A "1 to many" relationship in the magitude of 1-5000, e.g. for 5000 of the ClinicalTrial the answer to : Is FDA regulated Drug? Response: No.
    """
    isFdaRegulatedDrug: [ClinicalTrial] @relation(name: "IS_FDA_REGULATED_DRUG", direction: IN)

    """
    The response (e.g. Yes) can be the answer to Has Expanded Access for one or more Clinical Trials.
    A "1 to many" relationship in the magitude of 1-5000, e.g. for 5000 of the ClinicalTrial the answer to : Has Expanded? Response: No.
    """
    expandedAccess: [ClinicalTrial] @relation(name: "HAS_EXPANDED_ACCESS", direction: IN)
  }

  type Condition {
"Primary Disease or Condition Being Studied in the Trial, or the Focus of the Study"
    """
    The name(s) of the disease(s) or condition(s) studied in the clinical study, or the focus of the clinical study. 
    Use, if available, appropriate descriptors from NLM's Medical Subject Headings (MeSH)-controlled vocabulary thesaurus or terms from another vocabulary, 
    such as the Systematized Nomenclature of Medicine—Clinical Terms (SNOMED CT), that has been mapped to MeSH within the Unified Medical Language System (UMLS) Metathesaurus.
    """
    disease: String! @id
    # BioBERT

    """
    Keywords
    Words or phrases that best describe the protocol. 
    Keywords help users find studies in the database. Use NLM's Medical Subject Heading (MeSH)-controlled vocabulary terms where appropriate. Be as specific and precise as possible. 
    Avoid acronyms and abbreviations.
    A "1 to many" relationship in the magitude of 1-1000, e.g. one keyword can refer to one or more Cliical Trials.
    """
    keywords: [Keyword] @relation(name: "HAS_KEYWORD", direction: OUT)

    """
    A condition is being investigated in one or more Clinical Trials.
    A "1 to many" relationship in the magitude of 1-1200, e.g. a condition is being studies in one or more ClinicalTials.
    """
    trials: [ClinicalTrial] @relation(name: "IS_STUDYING", direction: IN)
  }

  type Phase {
"The phase of the CLinical Trial - only applicable for ClinicalTrial of StuyType:Internventional"
    """
      For a clinical trial of a drug product (including a biological product), the numerical phase of such clinical trial, consistent with terminology in 21 CFR 312.21 and in 21 CFR 312.85 for phase 4 studies. Select only one.

      N/A: Trials without phases (for example, studies of devices or behavioral interventions).
      Early Phase 1 (Formerly listed as "Phase 0"): Exploratory trials, involving very limited human exposure, with no therapeutic or diagnostic intent (e.g., screening studies, microdose studies). See FDA guidance on exploratory IND studies for more information.
      Phase 1: Includes initial studies to determine the metabolism and pharmacologic actions of drugs in humans, the side effects associated with increasing doses, and to gain early evidence of effectiveness; may include healthy participants and/or patients.
      Phase 2: Includes controlled clinical studies conducted to evaluate the effectiveness of the drug for a particular indication or indications in participants with the disease or condition under study and to determine the common short-term side effects and risks.
      Phase 3: Includes trials conducted after preliminary evidence suggesting effectiveness of the drug has been obtained, and are intended to gather additional information to evaluate the overall benefit-risk relationship of the drug.
      Phase 4: Studies of FDA-approved drugs to delineate additional information including the drug's risks, benefits, and optimal use.

    """
    phase: String! @id

    """
    A Phase can contain one or more ClinicalTrials.
    A "1 to many" relationship in the magitude of 1-1100, e.g. the type phase can contain multiple ClinicalTrials
    """
    trials: [ClinicalTrial] @relation(name: "IS_PHASE", direction: IN)
  }

  type Purpose {
"Primary Purpose of the ClinicalTrial"
    """
  The main objective of the intervention(s) being evaluated by the clinical trial. 
  Can be one of the below:
    Treatment: One or more interventions are being evaluated for treating a disease, syndrome, or condition.
    Prevention: One or more interventions are being assessed for preventing the development of a specific disease or health condition.
    Diagnostic: One or more interventions are being evaluated for identifying a disease or health condition.
    Supportive Care: One or more interventions are evaluated for maximizing comfort, minimizing side effects, or mitigating against a decline in the participant's health or function.
    Screening: One or more interventions are assessed or examined for identifying a condition, or risk factors for a condition, in people who are not yet known to have the condition or risk factor.
    Health Services Research: One or more interventions for evaluating the delivery, processes, management, organization, or financing of healthcare.
    Basic Science: One or more interventions for examining the basic mechanism of action (for example, physiology or biomechanics of an intervention).
    Device Feasibility: An intervention of a device product is being evaluated in a small clinical trial (generally fewer than 10 participants) to determine the feasibility of the product; or a clinical trial to test a prototype device for feasibility and not health outcomes. Such studies are conducted to confirm the design and operating specifications of a device before beginning a full clinical trial.
    Other: None of the other options applies.
    """
    name: String! @id

    """
    A Purpuse can contain one or more ClinicalTrials.
    A "1 to many" relationship in the magitude of 1-1500, e.g. the purpose 'Treatment' can contain multiple ClinicalTrials
    """
    trials: [ClinicalTrial] @relation(name: "HAS_PURPOSE", direction: IN)
  }

  type StudyIdentification {
"Unique Protocol Identification Number"
    """
    Any unique identifier assigned to the protocol by the sponsor.
    Limit: 30 characters.
    """
    studyId: String! @id

    """
    An acronym or abbreviation used publicly to identify the clinical study, if any. E.g. AI-COVID-Xr
    """
    acronym: String!

    """
    The ClinicalTrial can have antoher identification (acronym).
    A "1:1" relationship. An acronym is identifying a CliniclTrial.
    """
    trials: [ClinicalTrial] @relation(name: "HAS_IDENTIFICATION", direction: IN)

    """
    The Studyidentification is described/summarised in a title.
    A "1:1" relationship. An title is describing a StudyIdentification.
    """
    title: [Title] @relation(name: "HAS_TITLE", direction: OUT)
  }

  type Title {
"The title(s) of the Protocol"
    """
    A short title of the clinical study written in language intended for the lay public. The title should include, where possible, information on the participants, condition being evaluated, and intervention(s) studied.
    Limit: 300 characters, e.g. "Lung CT Scan Analysis of SARS-CoV2 Induced Lung Injury"
    """
    briefTitle: String! @id

    """
    The title of the clinical study, corresponding to the title of the protocol.
    Limit: 600 characters. E.g. "Lung CT Scan Analysis of SARS-CoV2 Induced Lung Injury by Machine Learning: a Multicenter Retrospective Cohort Study."
    """
    officialTitle: String!

    """
    A study can have a title.
    A "1:1" relationship. An StudyIdentification has a title.
    """
    identifications: [StudyIdentification] @relation(name: "HAS_TITLE", direction: IN)
  }

  type Status {
"Overall Recruitment Status"
    """
The recruitment status for the clinical study as a whole, based upon the status of the individual sites. 
If at least one facility in a multi-site clinical study has an Individual Site Status of "Recruiting," 
then the Overall Recruitment Status for the study must be "Recruiting." 
Can be one of the below:
    Not yet recruiting: Participants are not yet being recruited
    Recruiting: Participants are currently being recruited, whether or not any participants have yet been enrolled
    Enrolling by invitation: Participants are being (or will be) selected from a predetermined population
    Active, not recruiting: Study is continuing, meaning participants are receiving an intervention or being examined, but new participants are not currently being recruited or enrolled
    Completed: The study has concluded normally; participants are no longer receiving an intervention or being examined (that is, last participant’s last visit has occurred)
    Suspended: Study halted prematurely but potentially will resume
    Terminated: Study halted prematurely and will not resume; participants are no longer being examined or receiving intervention
    Withdrawn: Study halted prematurely, prior to enrollment of first participant
    """
    status: String! @id

    """
    If the clinical trial was stopped the reason is provided in the StopReason.
    A "1 to many" relationship in the magitude of 1-100, e.g. a given status can point ot several StopReasons.
    """
    stopReason: [StopReason] @relation(name: "HAS_REASON", direction: OUT)

    """
    A Status can contain many ClinicalTrials.
    A "1 to many" relationship in the magitude of 1-2500.
    
    """
    trials: [ClinicalTrial] @relation(name: "HAS_STATUS", direction: IN)
  }

  type StopReason {
"Why Study Stopped"
    """
    A brief explanation of the reason(s) why such clinical study was stopped (for a clinical study that is "Suspended," "Terminated," or "Withdrawn" prior to its planned completion as anticipated by the protocol).
    Limit: 250 characters.
    """
    reason: String! @id

    """
    A given StopReason is provided for a clinical study that is "Suspended," "Terminated," or "Withdrawn".
    A "1:1" relationship.    
    """
    trials: [ClinicalTrial] @relation(name: "WAS_STOPPED", direction: IN)

    """
    The StopReason is related to a Status:"Suspended," "Terminated," or "Withdrawn"
    A "1:1" relationship. 
    """
    status: [Status] @relation(name: "HAS_REASON", direction: IN)
  }

  type Start {
"Study Start Date"
    """
    The estimated date on which the clinical study will be open for recruitment of participants, or the actual date on which the first participant was enrolled.
    Note: "Enrolled" means a participant's, or their legally authorized representative’s, agreement to participate in a clinical study following completion of the informed consent process. Potential participants who are screened for the purpose of determining eligibility for the study, but do not participate in the study, are not considered enrolled, unless otherwise specified by the protocol.
    """
    date: String! @id # property is not currently a Cypher Date type

    """
    At a given start date one or more ClinicalTrials started. The dates are strings and not standardised.
    A "1 to many" relationship in the magitude of 1-100.
    """
    trials: [ClinicalTrial] @relation(name: "STARTED_AT", direction: IN)
  }

  type Completed {
"Date(s) for when the ClinicalTrial Completed"
    """
    Primary Completion Date (primaryCompletionDate):
    The date that the final participant was examined or received an intervention for the purposes of final collection of data for the primary outcome, whether the clinical study concluded according to the pre-specified protocol or was terminated. 
    In the case of clinical studies with more than one primary outcome measure with different completion dates, this term refers to the date on which data collection is completed for all of the primary outcomes.
   Once the clinical study has reached the primary completion date, the responsible party must update the Primary Completion Date to reflect the actual primary completion date.

    Study Completion Date (completionDate):
    The date the final participant was examined or received an intervention for purposes of final collection of data for the primary and secondary outcome measures and adverse events (for example, last participant’s last visit), whether the clinical study concluded according to the pre-specified protocol or was terminated.
    """
    completionDate: String! @id # property is not currently a Cypher Date type
    primaryCompletionDate: String! # property is not currently a Cypher Date type

    """
    At a given start date one or more ClinicalTrials completed. The dates are strings and not standardised.
    A "1 to many" relationship in the magitude of 1-100.
    """
    trials: [ClinicalTrial] @relation(name: "COMPLETED_AT", direction: IN)
  }

  type Investigator {
"The medical responsible person at a facility that conducts a Clinical Trial"
    """
    Name of the investigator, including first and last name
    e.g.: "Dr. Jonpaul ST Zee"
    """
    name: String! @id

    """
    Primary organizational affiliation of the individual;
    Limit: 160 characters.
    e.g.: "Hong Kong Sanatorium & Hospital"
    """
    affiliation: String!

    """
    The Investigator conducts one or more clinical trials.
    A "1 to many" relationship in the magitude of 1-10.
    """
    trials: [ClinicalTrial] @relation(name: "IS_CONDUCTED_BY", direction: IN)

    """
    The investigator can take different kinds of reponsibilites (if conducting more than one trial.)
    A "1 to many" relationship in the magitude of 1-2.
    """
    responsibilities: [Responsible] @relation(name: "IS_RESPOSIBLE", direction: IN)
  }

  type Responsible {
"An indication of whether the responsible party is the sponsor, the sponsor-investigator, or a principal investigator designated by the sponsor to be the responsible party. "
    """
    One can be selected of the below:
      Sponsor: The entity (for example, corporation or agency) that initiates the study
      Principal Investigator: The individual designated as responsible party by the sponsor (see Note)
      Sponsor-Investigator: The individual who both initiates and conducts the study
    """
    type: String! @id

    """
    The different Responsibility types can refer to many investigators.
    A "1 to many" relationship in the magitude of 1-1500.
    """
    investigator: [Investigator] @relation(name: "IS_RESPOSIBLE", direction: OUT)
  }

  type Description {
"Description of the background for the study being conducted a detailed and a short summary"
    """
    Definition: Extended description of the protocol, including more technical information (as compared to the Brief Summary), if desired. 
    Limit: 32,000 characters.
    e.g.: extract:"BACKGROUND: Assessment of frailty is today the best way to evaluate the biological age of the elderly person. 
    Fragility can be defined as a syndrome selected by the reduction of organized reserves and by the decreased resistance to "stressors", 
    resulting from the cumulative decline of multiple physiological systems that cause vulnerabilities and adverse consequences. 
    The impact of fragility on clinical outcomes has been investigated in numerous studies conducted on elderly patients in various care setting, 
    proving in all of them a significant and more reliable predictor of variables such as age, comorbidity and individual pathologies, 
    short and long-term mortality, length of stay and the onset of complications....
    """
    detailed: String! @id

    """
    A short description of the clinical study, including a brief statement of the clinical study's hypothesis, written in language intended for the lay public.
    Limit: 5000 characters
    e.g.: "This is a monocentric retro-prospective observational study that wants to evaluate the relation between frailty and clinical outcomes in elderly patients with COVID-19."
    """
    summary: String!

    """
    A description is detailing a ClinicalTrial
    A 1:1 relationship.
    """
    trials: [ClinicalTrial] @relation(name: "HAS_DESCRIPTION", direction: IN)
  }

  type Design {
"Description of the design of the study."
    """
    The strategy for assigning interventions to participants.

    Single Group: Clinical trials with a single arm
    Parallel: Participants are assigned to one of two or more groups in parallel for the duration of the study
    Crossover: Participants receive one of two (or more) alternative interventions during the initial phase of the study and receive the other intervention during the second phase of the study
    Factorial: Two or more interventions, each alone and in combination, are evaluated in parallel against a control group
    Sequential: Groups of participants are assigned to receive interventions based on prior milestones being reached in the study, such as in some dose escalation and adaptive design studies
    """
    # no required field for lookup id
    model: String

    """
    Provides details about the Interventional Study Model.
    Limit: 1000 characters.
    """
    description: String

    """
    A StudyDesign is used in one or more ClinicalTrials. 
    A "1 to many" relationship in the magitude of 1-2000. 
    """
    trials: [ClinicalTrial] @relation(name: "HAS_STUDY_DESIGN", direction: IN)

    """
    A study design can have one or more study arms (an arm can belong to a model), e.g. Parallel group design with two arms (active and comparator)
    A "1 to many" relationship in the magitude of 1-1500. 
    """
    arms: [Arm] @relation(name: "BELONGS_TO_MODEL", direction: IN)
  }

  type ObservationPeriod {
"Time Perspective - only for Observational studies"
    """
    Temporal relationship of observation period to time of participant enrollment. 
    One can be selected of the below:
    Retrospective: Look back using observations collected predominantly prior to subject selection and enrollment
    Prospective: Look forward using periodic observations collected predominantly following subject enrollment
    Cross-sectional: Observations or measurements made at a single point in time, usually at subject enrollment
    Other: Explain in Detailed Description
    """
    time: String! @id

    """
    The time type can describe the design of one or more ClinicalTrial being an observational study.
    A "1 to many" relationship in the magitude of 1-1500. A prospective time perspective refers to many ClinicalTrials.
    """
    trials: [ClinicalTrial] @relation(name: "HAS_OBSERVATION_PERIOD", direction: IN)
  }

  type Outcome {
"The objective of a CLinical Trial - the focus of the analysis."
    """
    Name of the specific outcome measure
    e.g.: "Give elements to focus the screening policies for COVID19."
    """
    name: String! @id

    """
    Description of the metric used to characterize the specific primary outcome measure, if not included in the primary outcome measure title.
    Limit: 999 characters.
    e.g.: ABC123
    """
    description: String

    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    time: String!

    """
    An outcome can be a primary outcome for a clinical Trial. e.g. "Satisfactory service regarding hospital response to COVID-19" is a primary outcome for a Clinical trial.
    A 1:1 relationship.    
    """
    primaryOutcomes: [ClinicalTrial] @relation(name: "HAS_PRIMARY_OUTCOME", direction: IN)

    """
    An outcome can be a secondary outcome for a clinical Trial. e.g. "Feelings of apprehension regarding hospital visits" is a secondary outcome for a Clinical trial.
    A 1:1 relationship.    
    """
    secondaryOutcomes: [ClinicalTrial] @relation(name: "HAS_SECONDARY_OUTCOME", direction: IN)

    """
    An outcome can be an other outcome for a clinical Trial. e.g. "Incidence of sequels after COVID-19" is an other outcome for a Clinical trial.
    A 1:1 relationship.  
    """
    otherOutcomes: [ClinicalTrial] @relation(name: "HAS_OTHER_OUTCOME", direction: IN)
  }

  type StudyPopulation {
"Information about the study population - observational studies"
    """
    A description of the population from which the groups or cohorts will be selected (for example, primary care clinic, community sample, residents of a certain town).
    Limit: 1000 characters.
    e.g.: "The study will be conducted on all patients hospitalized in COVID+ departments of the S.Gerardo Hospital of Monza (Geriatrics Unit, First Aid Unit and Emergency Medicine, Gastroenterology Unit, Infectious Diseases Unit)."
    """
    name: String! @id

    """
    Definition: Indicate the method used for the sampling approach and explain in the Detailed Description. One of the below:
    Probability Sample: Exclusively random process to guarantee that each participant or population has specified chance of selection, such as simple random sampling, systematic sampling, stratified random sampling, cluster sampling, and consecutive participant sampling
    Non-Probability Sample: Any of a variety of other sampling processes, such as convenience sampling or invitation to volunteer
    """
    sampling: String!

    """
    A StudyPopulation describes the group of participants in an observational study.
    A 1:1 relatioship.
    """
    trials: [ClinicalTrial] @relation(name: "HAS_STUDY_POPULATION", direction: IN)
  }

  type Gender {
"The sex and, if applicable, gender of the participants eligible to participate in the clinical study."
    """
    The sex of the participants eligible to participate in the clinical study. Note: "Sex" means a person's classification as male or female based on biological distinctions.
    One of the below:
    All: Indicates no limit on eligibility based on the sex of participants
    Female: Indicates that only female participants are being studied
    Male: Indicates that only male participants are being studied
    """
    name: String! @id

    """
    If eligibility is based on gender, provide descriptive information about Gender criteria.
    e.g.: "The respondents to the survey can choose one of the following responses to the question: "Which gender do you identify with?": male, female, non binary, I prefer not to say"
    """
    description: String!

    """
    Different types of gender groups  (Male, female or both/all) can be included in a ClinicalTrial.
    A 1:1 relationship due to the possibility to add a description.
    """
    trials: [ClinicalTrial] @relation(name: "INCLUDES_GENDER", direction: IN)
  }

  type AgeRange {
"The minimum and maximum age of potential participants eligible for the clinical study, provided in relevant units of time."
    """
    The numerical value, if any, for the maximum age a potential participant must meet to be eligible for the clinical study.
    Unit of Time:
    Years
    Months
    Weeks
    Days
    Hours
    Minutes
    N/A (No limit)

    e.g.: 	"99 Years"
    """
    maxAge: String! @id

    """
    The numerical value, if any, for the minimum age a potential participant must meet to be eligible for the clinical study.
    Unit of Time:
    Years
    Months
    Weeks
    Days
    Hours
    Minutes
    N/A (No limit)

    e.g.: "18 Years"
    """
    minAge: String!

    """
    An age range is specified for a Clinical Trial.
    A 1:1 repatioship.
    """
    trials: [ClinicalTrial] @relation(name: "INCLUDES_AGE_RANGE", direction: IN)
  }

  type InclusionCriteria {
"A limited list of criteria for selection of participants in the clinical study, provided in terms of inclusion criteria and suitable for assisting potential participants in identifying clinical studies of interest."
    """
    A criteria that defines who to include in a ClinicalTrial. Note the criteria are not standardised, e.g. "Signed informed consent" and "Able to provide informed consent"
    e.g.: "Diagnosis of COVID related pneumonia"
    """
    criteria: String! @id

    """
    An Inclusion Criteria is included in a clinical trial.
    A "1 to many" relationship in the magitude of 1-50. e.g. "Age ≥ 18 years" is included in many ClinicalTrials.
    """
    trials: [ClinicalTrial] @relation(name: "HAS_INCLUSION_CRITERIA", direction: IN)
  }

  type ExclusionCriteria {
"A limited list of criteria for selection of participants in the clinical study, provided in terms of exclusion criteria and suitable for assisting potential participants in identifying clinical studies of interest."
    """
    A criteria that defines who to exclude in a ClinicalTrial. Note the criteria are not standardised, e.g. "Pregnancy", "Pregnancy.", "Pregnant women"
    e.g.: ABC123
    """
    criteria: String! @id

    """
    An Exclusion Criteria is included in a clinical trial.
    A "1 to many" relationship in the magitude of 1-200. e.g. "Pregnancy" is included in many ClinicalTrials.
    """
    trials: [ClinicalTrial] @relation(name: "HAS_EXCLUSION_CRITERIA", direction: IN)
  }

  type Contact {
"Central Contact Person (or Facility Contact required)"
    """
    The name or title, toll-free telephone number and email address of a person to whom questions concerning enrollment at any location of the study can be addressed.


    Email: electronic mail address of the central contact person
    """
    email: String! @id

    """
    Last Name or Official Title of the central contact person.
    """
    name: String!

    """
    A contact person is assigned to a clinical trial. 
    A "1 to many" relationship in the magitude of 1-20. e.g. "Saïd CHAYER, PhD, HDR" is a contact person in many ClinicalTrials.
    """
    trials: [ClinicalTrial] @relation(name: "HAS_CONTACT_PERSON", direction: IN)
  }

  type BioSpecimen {
"Information about samples retained in a biorepository from study participants "
    """
    Indicate whether samples of material from research participants are retained in a biorepository. 
    One of the below can be selected:
    None Retained: No samples retained
    Samples With DNA: Samples retained, with potential for extraction of DNA from at least one of the types of samples retained (e.g., frozen tissue, whole blood)
    Samples Without DNA: Samples retained, with no potential for DNA extraction from any retained samples (e.g., fixed tissue, plasma)

    """
    retension: String! @id

    """
    Biospecimen Description
    All types of biospecimens to be retained (e.g., whole blood, serum, white cells, urine, tissue).
    Limit: 1000 characters.
    """
    description: String!

    """
    BioSpecimen information can be applicable for many ClinicalTrials, e.g "Samples With DNA" is applicable for many ClinialTrials.
    A "1 to many" relationship in the magitude of 1-200.
    """
    trials: [ClinicalTrial] @relation(name: "HAS_SAMPLES_RETAINED_IN_BIOREPOSITORY", direction: IN)
  }

  type Arm {
"A pre-specified group or subgroup of participant(s) in a clinical trial assigned to receive specific intervention(s) (or no intervention) according to a protocol."
    """
    The short name used to identify the arm.
    Limit: 100 characters.
    e.g.: "covid-19 pneumonia related patients", "Austria" (if study is investigating country differences).
    """
    name: String! @id

    """
    If needed, additional descriptive information (including which interventions are administered in each arm) to differentiate each arm from other arms in the clinical trial.
    Limit: 999 characters.
    e.g.: "The study will be conducted on all patients hospitalized in COVID+ departments of the S.Gerardo Hospital in Monza (Geriatrics Unit, First Aid Unit and Emergency Medicine, Gastroenterology Unit, Infectious Disease Unit) affected by pneumonia COVID related."
    """
    description: String

    """
    An arm belongs to a model in a design, e.g. arm:"Patients with SARS-CoV-2 infection" is a 'arm' in the "Cohort" model.
    A 1:1 relationship.
    """
    model: [Design] @relation(name: "BELONGS_TO_MODEL", direction: OUT)

    """
    An arm is being investigated in a ClinicalTrial, e.g. the arm "Patients with SARS-CoV-2 infection" is being investigated in a ClinicalTrial.
    """
    trials: [ClinicalTrial] @relation(name: "HAS_STUDY_ARMS", direction: IN)
  }
`;
