// Sample OSDU entities for demonstration
export const sampleEntities = [
  {
    id: 'wellbore-1.5.1',
    name: 'Wellbore',
    type: 'master-data',
    version: '1.5.1',
    pumlContent: `@startuml
hide methods
skinparam class {
    BackgroundColor<<master-data>> #ffa080
    BackgroundColor<<work-product-component>> #f9d949
    BackgroundColor<<reference-data>> #79dfdf
}

class "Wellbore" as Wellbore <<master-data>>
class "Well" as Well <<master-data>>
class "Organisation" as Organisation <<master-data>>
class "WellboreTrajectory" as WellboreTrajectory <<work-product-component>>
class "WellboreReason" as WellboreReason <<reference-data>>

Wellbore --> Well : "WellID"
Wellbore --> Organisation : "CurrentOperatorID"
Wellbore --> WellboreTrajectory : "DefinitiveTrajectoryID"
Wellbore --> WellboreReason : "WellboreReasonID"

@enduml`,
    schema: {
      "$id": "https://schema.osdu.opengroup.org/json/master-data/Wellbore.1.5.1.json",
      "title": "Wellbore",
      "description": "A hole in the ground extending from a point at the earth's surface to the maximum point of penetration.",
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "Entity ID"
        },
        "kind": {
          "type": "string",
          "description": "Entity Kind"
        },
        "data": {
          "allOf": [
            {
              "type": "object",
              "properties": {
                "WellID": {
                  "type": "string",
                  "description": "Reference to the parent Well"
                },
                "SequenceNumber": {
                  "type": "integer",
                  "description": "Order in which wellbores were drilled"
                },
                "WellboreReasonID": {
                  "type": "string",
                  "description": "Reason why this wellbore was drilled"
                },
                "TrajectoryTypeID": {
                  "type": "string",
                  "description": "General geometry of the wellbore"
                },
                "DefinitiveTrajectoryID": {
                  "type": "string",
                  "description": "Authoritative trajectory version"
                }
              }
            }
          ]
        }
      }
    },
    example: {
      "id": "namespace:master-data--Wellbore:c7c421a7-f496-5aef-8093-298c32bfdea9",
      "kind": "osdu:wks:master-data--Wellbore:1.5.1",
      "data": {
        "WellID": "namespace:master-data--Well:SomeUniqueWellID:",
        "SequenceNumber": 2,
        "WellboreReasonID": "namespace:reference-data--WellboreReason:AccidentalSidetrack:",
        "TrajectoryTypeID": "namespace:reference-data--WellboreTrajectoryType:Vertical:",
        "DefinitiveTrajectoryID": "namespace:work-product-component--WellboreTrajectory:WellboreTrajectory-911bb71f-06ab-4deb-8e68-b8c9229dc76b:",
        "FacilityName": "Example Wellbore Name"
      }
    }
  },
  {
    id: 'well-1.3.0',
    name: 'Well',
    type: 'master-data',
    version: '1.3.0',
    pumlContent: `@startuml
hide methods
skinparam class {
    BackgroundColor<<master-data>> #ffa080
    BackgroundColor<<reference-data>> #79dfdf
}

class "Well" as Well <<master-data>>
class "Field" as Field <<master-data>>
class "Organisation" as Organisation <<master-data>>
class "WellType" as WellType <<reference-data>>

Well --> Field : "FieldID"
Well --> Organisation : "OperatorID"
Well --> WellType : "WellTypeID"

@enduml`,
    schema: {
      "$id": "https://schema.osdu.opengroup.org/json/master-data/Well.1.3.0.json",
      "title": "Well",
      "description": "A unique surface location where wellbores are drilled.",
      "type": "object",
      "properties": {
        "data": {
          "allOf": [
            {
              "type": "object",
              "properties": {
                "FieldID": {
                  "type": "string",
                  "description": "Reference to the Field"
                },
                "OperatorID": {
                  "type": "string",
                  "description": "Current operator organization"
                },
                "WellTypeID": {
                  "type": "string",
                  "description": "Type classification of the well"
                }
              }
            }
          ]
        }
      }
    },
    example: {
      "id": "namespace:master-data--Well:SomeUniqueWellID:",
      "kind": "osdu:wks:master-data--Well:1.3.0",
      "data": {
        "FieldID": "namespace:master-data--Field:SomeUniqueFieldID:",
        "OperatorID": "namespace:master-data--Organisation:SomeUniqueOrganisationID:",
        "WellTypeID": "namespace:reference-data--WellType:Oil:",
        "FacilityName": "Example Well Name"
      }
    }
  }
];