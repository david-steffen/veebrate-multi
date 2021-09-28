// Import lit-html
import {html, render, nothing} from 'lit-html';

navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

const inputHandler = (e) => {
  update("SET_USERNAME", e.target.value);
};

const connectHandler = (e) => {
  update("SET_CONN");
};

const startVibrateHandler = (e) => {
  update("SEND_MESSAGE", true);
};

const endVibrateHandler = (e) => {
  update("SEND_MESSAGE", false);
};

const selectHandler = (e) => {
  update("SET_VIBRATE_SPEED", e.target.value);
};

const recipentHandler = (connectionID) => {
  return () => {
    update("SET_RECIPIENT", connectionID);
  }
}

const resetHandler = () => {
  update("CLOSE_EVENTBUS");
}

const startTemplate = (data) => html`
<section class="hero is-fullheight">
  <div class="hero-body">
    <div class="container has-text-centered">
      <h1 class="title">
        Veebrate
      </h1>
      <h2 class="subtitle">
        A silly app to make your or another user's phone vibrate
      </h2>
      <h3 class="subtitle is-size-6">
        (Best experienced on Android)
      </h3>
      <p class="is-size-6">
        Enter your username
      </p>
      <div class="field has-addons has-addons-centered">
        <div class="control">
          <input
            class="input"
            type="text"
            name="username"
            @input=${inputHandler}
          >
        </div>
        <div class="control">
          <button
            class="button is-success${data.isLoading ? ' is-loading' : ''}"
            @click=${connectHandler}
          >Confirm</button>
        </div>
      </div>
      ${data.error.length
        ? html`<p class="help is-danger">You need to enter a username to continue</p>`
        : nothing
      }
    </div>
  </div>
</section>
`;

const listItemClasses = (data, user) => {
  let classes = ['list-item'];
  if (data.recipientID === user.connectionID) {
    classes.push('is-active');
  }
  return  classes.join(' ');
}

const formatVibrateSpeedText = ({vibrateSpeed, vibrateSpeedLimit}) => {
  const base = vibrateSpeedLimit / 3;
  if (vibrateSpeed === 0) {
    return 'fastest';
  } else if (vibrateSpeed < base) {
    return 'fast';
  } else if (vibrateSpeed >= base && vibrateSpeed < base * 2) {
    return 'medium';
  } else if (vibrateSpeed >= base * 2 && vibrateSpeed < vibrateSpeedLimit) {
    return 'slow';
  } else if (vibrateSpeed === vibrateSpeedLimit) {
    return 'slowest';
  }
}

const mainTemplate = (data) => html`
<section class="container is-fluid">
  <nav class="level">
    <div class="level-left">
      <div class="level-item has-text-centered">
        <p class="title">Veebrate</p>
      </div>
    </div>
    <div class="level-right">
      <div class="level-item has-text-centered">
        <button class="button is-white" @click="${resetHandler}">
          <span class="icon">
            <i class="fas fa-sign-out-alt"></i>
          </span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  </nav>
  <div class="level">
    <div class="level-left">
      <div class="level-item has-text-centered">
        <h2 class="subtitle">Users online</h2>
      </div>
    </div>
    <div class="level-right">
      <div class="level-item">
        <p><strong>Vibrate speed:</strong><span class="speed-text has-text-centered">${formatVibrateSpeedText(data)}</span></p>
        <div class="dropdown is-right is-hoverable">
          <div class="dropdown-trigger">
            <button class="button is-small" aria-haspopup="true" aria-controls="dropdown-menu6">
              <span class="icon is-small"><i class="fas fa-cog"></i></span>
            </button>
          </div>
          <div class="dropdown-menu" role="menu">
            <div class="dropdown-content">
              <div class="dropdown-item">
                <span>slow</span>
                <input class="slider has-output is-fullwidth" @input="${selectHandler}" type="range" min="0" max="${data.vibrateSpeedLimit}" value="${data.vibrateSpeed}">
                <span>fast</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <ul class="list is-hoverable">
    ${data.usersList.map((user) => html`
      <li class="${listItemClasses(data, user)}" @click="${recipentHandler(user.connectionID)}">
        <div class="level is-mobile">
          <div class="level-left">
            <div class="level-item">
              <span class="icon"><i class="fas fa-user"></i></span>
            </div>
            <div class="level-item">
              <p class="has-text-weight-bold">${user.userName}</p>
            </div>
            ${data.connectionID === user.connectionID
              ? html`<div class="level-item"><p>(you)</p></div>`
              : nothing
            }
          </div>
          <div class="level-right">
            ${data.senderID === user.connectionID
              ? html`<div class="level-item"><span class="icon has-text-warning"><i class="fas fa-arrow-down"></i></span></div>`
              : nothing
            }
            ${data.sending && data.recipientID === user.connectionID
              ? html`<div class="level-item"><span class="icon has-text-success"><i class="fas fa-arrow-up"></i></span></div>`
              : nothing
            }
          </div>
        </div>
      </li>
    `)}
  </ul>
</section>
<section class="container is-fluid footer-container has-background-light">
  <footer class="footer">
  <div class="content">
    <div class="field">
      <div class="control">
        <button
          ?disabled=${!data.recipientID.length}
          class="button is-success is-fullwidth"
          @mousedown="${startVibrateHandler}"
          @mouseup="${endVibrateHandler}"
          @touchstart="${startVibrateHandler}"
          @touchend="${endVibrateHandler}"
          @touchcancel="${endVibrateHandler}"
        >SEND</button>
      </div>
    </div>
  </div>
  </footer>
</section>
`;

const view = (data) => html`
<main>
  ${data.isConnected
    ? mainTemplate(data)
    : startTemplate(data)
  }
</main>
`;

const initState = {
  userName: '',
  isConnected: false,
  isLoading: false,
  error: '',
  eventbus: null,
  connectionID: '',
  vibrateSpeed: 300,
  recipientID: '',
  senderID: '',
  sending: false,
  usersList: [],
  timerID: null,
  vibrateSpeedMin: 200,
  vibrateSpeedLimit: 600,
}

let store = {
  state: initState,
  actions: {
    "SET_USERNAME": ({state}, userName) => {
      state.userName = userName;
    },
    "SET_CONN": ({update, state}) => {
      if (state.userName === '') {
        state.error = 'You need to enter a username';
      } else if (state.eventbus === null) {
        state.isLoading = true;
        let eventbus = new EventBus(`${window.location.origin}/eventbus`);
        eventbus.onopen = (event) => {
          if (state.error.length) {
            update("SET_ERROR", '');
          }
          eventbus.registerHandler('user.connected', (error, msg) => {
            update("SET_CONN_RESPONSE", {
              isConnected: true,
              connectionID: msg.body.connectionID,
              users: msg.body.users
            });
          });
          eventbus.registerHandler('user.messageOut', (error, msg) => {
            update("SET_INCOMING_MESSAGE", msg.body);
          });
          eventbus.send('user.connect', {
            canVibrate: 'function' === typeof navigator.vibrate,
            userName: state.userName
          });
        }
        eventbus.onclose = (event) => {
          update("RESET_STATE");
        }
        eventbus.onerror = (event) => {
          console.log('error', event);
        }
        state.eventbus = eventbus;
      }
    },
    "SET_ERROR": ({state}, error) => {
      state.error = error;
    },
    "SET_CONN_STATUS": ({state}, isConnected) => {
      state.isConnected = isConnected;
    },
    "SET_CONN_RESPONSE": ({update, state}, {isConnected, connectionID, users}) => {
      state.isLoading = !isConnected;
      state.isConnected = isConnected;
      state.connectionID = connectionID;
      if (state.recipientID.length) {
        const isCurrentRecipientConnected = users.some((user) => {
          return state.recipientID === user.connectionID;
        })
        if (!isCurrentRecipientConnected) {
          state.recipientID = '';
        }
      }
      if (users.length > 1) {
        const currentUserIndex = users.findIndex((user) => {
          return user.connectionID === state.connectionID;
        })
        const currentUser = users[currentUserIndex];
        users.splice(currentUserIndex, 1)
        users.unshift(currentUser);
        state.usersList = users;
      } else if (users.length) {
        state.usersList = users;
      } else {
        state.isConnected = false;
        state.connectionID = '';
        state.usersList = [];
        update("SET_EVENTBUS", null);
      }
    },
    "SEND_MESSAGE": ({state}, vibrate) => {
      let payload = {
        recipientID: state.recipientID,
        connectionID: state.connectionID,
        vibrateSpeed: state.vibrateSpeed + state.vibrateSpeedMin,
        vibrate
      }
      state.eventbus.send('user.messageIn', payload);
      state.sending = vibrate;
    },
    "SET_EVENTBUS": ({state}, eventbus) => {
      state.eventbus = eventbus;
    },
    "SET_VIBRATE_SPEED": ({state}, speed) => {
      state.vibrateSpeed = (state.vibrateSpeedLimit - speed);
    },
    "SET_RECIPIENT": ({state}, recipientID) => {
      state.recipientID = recipientID;
    },
    "SET_INCOMING_MESSAGE": ({state}, message) => {
      state.vibrate = message.vibrate;
      if (state.vibrate) {
        state.senderID = message.connectionID;
        state.timerID = setInterval(() => {
          navigator.vibrate(message.vibrateSpeed);
        }, message.vibrateSpeed);
      } else {
        state.senderID = '';
        clearInterval(state.timerID);
        state.timerID = null;
      }
    },
    "CLOSE_EVENTBUS": ({state}) => {
      state.eventbus.close();
    },
    "RESET_STATE": () => {
      return initState;
    }
  }
}

const app = (store) => {
  let state = Object.assign({}, store.state)
  render(view(state), document.body);
  return function updateHandler(action, data) {
    let context = { update: updateHandler, state }
    const response = store.actions[action].call(this, context, data);
    if (response) {
      state = Object.assign({}, response);
    }
    render(view(state), document.body);
  }
}

const update = app(store);
