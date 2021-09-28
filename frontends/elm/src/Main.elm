port module Main exposing (main)

import Browser
import Html exposing 
  ( Html
  , button
  , div
  , text
  , section
  , input
  , h1
  , h2
  , h3
  , p
  , span
  , i
  , ul
  , li
  , nav
  , strong
  , footer
  , main_
  )
import Html.Attributes as Attributes exposing
  ( type_
  , class
  , classList
  , name
  , value
  , attribute
  , disabled
  )
import Html.Events exposing
  ( onInput
  , onClick
  )
import Json.Encode as JsonEncode
import Json.Decode as Json
import Result exposing (Result)
import Html.Keyed as Keyed
import Html.Events.Extra.Mouse as Mouse
import Html.Events.Extra.Touch as Touch

port connect : Json.Value -> Cmd msg
port connected : (Json.Value -> msg) -> Sub msg
port messageIn : Json.Value -> Cmd msg
port messageOut : (Json.Value -> msg) -> Sub msg
port closeConnection : () -> Cmd msg
port vibrateCommand : Json.Value -> Cmd msg

-- MAIN

main : Program Flags Model Msg
main =
  Browser.document
    { init = init
    , update = update
    , view = view
    , subscriptions = subscriptions
    }

-- SUBSCRIPTIONS

subscriptions : Model -> Sub Msg
subscriptions _ =
  Sub.batch
    [ messageOut (decodeMessage >> MessageOut)
    , connected (decodeConnected >> Connected)
    ]

-- MODEL

type alias Model = 
  { userName : String
  , isConnected : Bool
  , canVibrate : Bool
  , isLoading : Bool
  , error : Maybe String
  , connectionID : Maybe String
  , vibrateSpeed : Int
  , recipientID : Maybe String
  , senderID : Maybe String
  , sending : Bool
  , usersList : List User
  , vibrateSpeedMin : Int
  , vibrateSpeedLimit : Int
  }

type alias Flags = Bool

type alias Message =
  { recipientID : String
  , connectionID : String
  , vibrateSpeed : Int
  , vibrate : Bool
  }

type alias ConnectedPayload =
  { isConnected : Bool
  , connectionID : String
  , users : List User
  }

type alias User =
  { canVibrate : Bool
  , userName : String
  , connectionID : String
  }

init : Flags -> ( Model, Cmd Msg )
init flags =
  (
    { userName = ""
    , isConnected = False
    , canVibrate = flags
    , isLoading = False
    , error = Nothing
    , connectionID = Nothing
    , vibrateSpeed = 300
    , recipientID = Nothing
    , senderID = Nothing
    , sending = False
    , usersList = []
    , vibrateSpeedMin = 200
    , vibrateSpeedLimit = 600
    }
  , Cmd.none
  )


-- UPDATE

type Msg
  = MessageOut (Result Json.Error Message)
  | MessageIn Bool
  | Connected (Result Json.Error ConnectedPayload)
  | InputUserName String
  | InputSlider String
  | Connect
  | Reset
  | CloseConnection
  | SetRecipientID String
  | SendMessage
  | EndMessage

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
  case msg of
    Connected value ->
      case value of      
        Ok connectedPayload ->
          let
            (includedList, excludedList) = List.partition (\user -> user.connectionID == connectedPayload.connectionID) connectedPayload.users
          in
          ( 
            { model
            | isLoading = not connectedPayload.isConnected
            , isConnected = connectedPayload.isConnected
            , connectionID = Just connectedPayload.connectionID
            , usersList = includedList ++ excludedList
            }
          , Cmd.none
          )
        Err _ ->
          ( model, Cmd.none )
    MessageOut value ->
      case value of
        Ok message ->
          let
            senderID = if message.vibrate then
                Just message.connectionID
              else
                Nothing
          in
          ( 
            { model
            | senderID = senderID
            }
          , vibrateCommand
            <| JsonEncode.object
              [ ( "vibrate", JsonEncode.bool message.vibrate )
              , ( "vibrateSpeed", JsonEncode.int message.vibrateSpeed )
              ]
          )
        Err _ ->
          ( model, Cmd.none )
    MessageIn vibrate ->
      let
        newModel = 
          { model
          | sending = vibrate
          }
        messageIDs = Maybe.map2 Tuple.pair newModel.recipientID newModel.connectionID
        vibrateSpeed = newModel.vibrateSpeed + newModel.vibrateSpeedMin
      in
        case messageIDs of
          Just (recipientID, connectionID) ->
            ( newModel
            , messageIn 
              <| encodeMessage
              <| Message recipientID connectionID vibrateSpeed newModel.sending
            )
          Nothing ->
            ( model, Cmd.none )
    InputUserName userName ->
      ( 
        { model
        | userName = userName
        }
      , Cmd.none
      )
    InputSlider vibrateSpeed ->
      let
        correctedVibrateSpeed = String.toInt vibrateSpeed |> Maybe.withDefault model.vibrateSpeedLimit
      in
        ( 
          { model
          | vibrateSpeed = model.vibrateSpeedLimit - correctedVibrateSpeed
          }
        , Cmd.none
        )
    Connect ->
      if String.length model.userName > 0 then
        ( model, connect <| encodeConnect model )
      else
        ( 
          { model
          | error = Just "You need to enter a username to continue"
          }
        , Cmd.none
        )
    Reset ->
      let
        (newModel, _) = init model.canVibrate
      in
      update CloseConnection newModel
    CloseConnection ->
      ( model, closeConnection ())
    SetRecipientID recipientID ->
      ( 
        { model
        | recipientID = Just recipientID
        }
      , Cmd.none
      )
    SendMessage ->
      update (MessageIn True) model
    EndMessage ->
      update (MessageIn False) model

decodeMessage : Json.Value -> Result Json.Error Message
decodeMessage =
  Json.decodeValue (
    Json.map4 Message
      (Json.field "recipientID" Json.string)
      (Json.field "connectionID" Json.string)
      (Json.field "vibrateSpeed" Json.int)
      (Json.field "vibrate" Json.bool)
  )

decodeConnected : Json.Value -> Result Json.Error ConnectedPayload
decodeConnected =
  Json.decodeValue (
    Json.map3 ConnectedPayload
      (Json.field "isConnected" Json.bool)
      (Json.field "connectionID" Json.string)
      (Json.field "users" (Json.list decodeUser))
  )

decodeUser : Json.Decoder User
decodeUser =
  Json.map3 User
    (Json.field "canVibrate" Json.bool)
    (Json.field "userName" Json.string)
    (Json.field "connectionID" Json.string)

encodeMessage : Message -> JsonEncode.Value
encodeMessage message = 
  JsonEncode.object
      [ ( "message", JsonEncode.object
          [ ( "recipientID", JsonEncode.string message.recipientID )
          , ( "connectionID", JsonEncode.string message.connectionID )
          , ( "vibrateSpeed", JsonEncode.int message.vibrateSpeed )
          , ( "vibrate", JsonEncode.bool message.vibrate )
          ]
        )
      , ( "type", JsonEncode.string "user_messageIn" )
      ]

encodeConnect : Model -> JsonEncode.Value
encodeConnect model = 
  JsonEncode.object
      [ ( "message", JsonEncode.object
          [ ( "userName", JsonEncode.string model.userName )
          , ( "canVibrate", JsonEncode.bool model.canVibrate )
          ]
        )
      , ( "type", JsonEncode.string "user_connect" )
      ]

-- VIEW
startView : Model -> List (Html Msg)
startView model =
  [ section
    [ class "hero is-fullheight" ]
    [ div
      [ class "hero-body" ]
      [ div [ class "container has-text-centered" ]
        [ h1
          [ class "title" ]
          [ text "Veebrate" ]
        , h2
          [ class "subtitle" ]
          [ text "A silly app to make your or another user's phone vibrate" ]
        , h3
          [ class "subtitle is-size-6" ]
          [ text "(Best experienced on Android)" ]
        , p
          [ class "is-size-6" ]
          [ text "Enter your username" ]
        , div
          [ class "field has-addons has-addons-centered" ]
          [ div
            [ class "control" ]
            [ input
              [ class "input"
              , type_ "text"
              , name "username"
              , onInput InputUserName
              ]
              []
            ]
          , div [ class "control" ]
            [ button 
              [ class <| if model.isLoading then 
                  "button is-success is-loading"
                else
                  "button is-success"
              , onClick Connect
              ]
              [ text "Confirm" ]
            ]
          ]
        , case model.error of
            Just error ->
              p
                [ class "help is-danger" ]
                [ text error ]
            Nothing ->
              div [] []
        ]
      ]
    ]
  ]

formatVibrateSpeedText : Model -> String
formatVibrateSpeedText ({vibrateSpeed, vibrateSpeedLimit}) =
  let
    base = round <| toFloat vibrateSpeedLimit / 3
  in
    if vibrateSpeed == 0 then
      "fastest"
    else if vibrateSpeed < base then
      "fast"
    else if vibrateSpeed >= base && vibrateSpeed < base * 2 then
      "medium"
    else if vibrateSpeed >= base * 2 && vibrateSpeed < vibrateSpeedLimit then
      "slow"
    else
      "slowest"

indicators : String -> String -> Bool -> User -> List (Html Msg)
indicators senderID recipientID sending user =
  let
    isIncoming = senderID == user.connectionID
    isOutgoing = sending && recipientID == user.connectionID
    incomingIndicator = 
      div
        [ class "level-item" ]
        [ span [ class "icon has-text-warning" ]
          [ i [ class "fas fa-arrow-down" ]
            []
          ]
        ]
    outgoingIndicator =
      div
        [ class "level-item" ]
        [ span
          [ class "icon has-text-success" ]
          [ i
            [ class "fas fa-arrow-up" ]
            []
          ]
        ]
  in
    if isIncoming && isOutgoing then
      [incomingIndicator, outgoingIndicator]
    else if isIncoming then
      [incomingIndicator]
    else if isOutgoing then
      [outgoingIndicator]
    else
      []


userListItem : Model -> User -> Html Msg
userListItem model user =
  let
    connectionID = model.connectionID |> Maybe.withDefault ""
    senderID = model.senderID |> Maybe.withDefault ""
    recipientID = model.recipientID |> Maybe.withDefault ""
    listItemClasses = [("list-item", True), ("is-active", recipientID == user.connectionID)]
  in
  li
    [ classList listItemClasses
    , onClick (SetRecipientID user.connectionID)
    ]
    [ div
      [ class "level is-mobile" ]
      [ div
        [ class "level-left" ]
        [ div
          [ class "level-item" ]
          [ span [ class "icon" ]
            [ i [ class "fas fa-user" ]
              []
            ]
          ]
        , div [ class "level-item" ]
          [ p 
            [ class "has-text-weight-bold" ]
            [ text user.userName ]
          ]
        , if connectionID == user.connectionID then
            div [ class "level-item" ]
              [ p []
                [ text "(you)" ]
              ]
          else
            div [] []
        ]
      , div [ class "level-right" ]
        (indicators senderID recipientID model.sending user)
      ]
    ]

mainView : Model -> List (Html Msg)
mainView model =
  [ section
    [ class "container is-fluid" ]
    [ nav
      [ class "level" ]
      [ div
        [ class "level-left" ]
        [ div
          [ class "level-item has-text-centered" ]
          [ p
            [ class "title" ]
            [ text "Veebrate" ]
          ]
        ]
      , div
        [ class "level-right" ]
        [ div
          [ class "level-item has-text-centered" ]
          [ button
            [ class "button is-white", onClick Reset ]
            [ span
              [ class "icon" ]
              [ i
                [ class "fas fa-sign-out-alt" ]
                []
              ]
            , span
              []
              [ text "Logout" ]
            ]
          ]
        ]
      ]
    , div
      [ class "level" ]
      [ div
        [ class "level-left" ]
        [ div
          [ class "level-item has-text-centered" ]
          [ h2
            [ class "subtitle" ]
            [ text "Users online" ]
          ]
        ]
      , div
        [ class "level-right" ]
        [ div
          [ class "level-item" ]
          [ p
            []
            [ strong 
              []
              [ text "Vibrate speed:" ]
            , span
              [ class "speed-text has-text-centered" ]
              [ text <| formatVibrateSpeedText model ]
            ]
          , div
            [ class "dropdown is-right is-hoverable" ]
            [ div
              [ class "dropdown-trigger" ]
              [ button
                [ class "button is-small"
                , attribute "aria-haspopup" "true"
                , attribute "aria-controls" "dropdown-menu6"
                ]
                [ span
                  [ class "icon is-small" ]
                  [ i
                    [ class "fas fa-cog" ]
                    []
                  ]
                ]
              ]
            , div
              [ class "dropdown-menu"
              , attribute "role" "menu"
              ]
              [ div
                [ class "dropdown-content" ]
                [ div
                  [ class "dropdown-item" ]
                  [ span
                    []
                    [ text "slow" ]
                  , input
                    [ class "slider has-output is-fullwidth"
                    , onInput InputSlider
                    , type_ "range"
                    , Attributes.min "0"
                    , Attributes.max <| String.fromInt model.vibrateSpeedLimit
                    , value <| String.fromInt <| model.vibrateSpeedLimit - model.vibrateSpeed
                    ]
                    []
                  , span []
                    [ text "fast" ]
                  ]
                ]
              ]
            ]
          ]
        ]
      ]
    , Keyed.ul
      [ class "list is-hoverable" ]
      (List.map (\user -> (user.connectionID ,userListItem model user)) model.usersList)
    ]
  , section
    [ class "container is-fluid footer-container has-background-light" ]
    [ footer
      [ class "footer" ]
      [ div
        [ class "content" ]
        [ div
          [ class "field" ]
          [ div
            [ class "control" ]
            [ button
              [ disabled <| model.recipientID == Nothing
              , class "button is-success is-fullwidth"
              , Mouse.onDown (\_ -> SendMessage)
              , Mouse.onUp (\_ -> EndMessage)
              , Touch.onStart (\_ -> SendMessage)
              , Touch.onEnd (\_ -> EndMessage)
              , Touch.onCancel (\_ -> EndMessage)
              ]
              [ text "SEND" ]
            ]
          ]
        ]
      ]
    ]
  ]

view : Model -> Browser.Document Msg
view model =
  { title =  "Veebrate"
  , body =
    [ main_ []
      (if model.isConnected then
        mainView model
      else
        startView model
      )
    ]
  }
