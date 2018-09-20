<template>
  <div id="contribute">
    <div v-if="disableContribution">
      <h3>{{ disableErrorCode }}</h3>
    </div>
    <div v-if="!disableContribution">
      <h3>Contribute</h3>
      <hr>
      <div v-if="depositAddress" style="margin-top: 20px;">
        <b-row>
          <b-col>
            <h5>Send Your Contribution</h5>
          </b-col>
        </b-row>
        <b-row style="margin-top: 45px;">
          <b-col sm="2">
            <img :src="iconMap[selectedCurrency]" width="100">
          </b-col>
          <b-col v-if="!actualDepositAmount">
            <h5 class="mt-0 mb-1">Expected Deposit Amount: {{ selectedCurrencyAmount }} {{ selectedCurrency }}</h5>
            <p style="margin-top: 20px;">to the following address<br> 
              <span style="font-size: 18px; color: lightgreen;">{{ depositAddress }}</span>
            </p>
            <b-button size="sm">Copy Address</b-button>
            <b-button size="sm">Show QR Code</b-button>
            <b-button 
              size="sm" 
              variant="info" 
              @click="cancelDeposit()"
              v-if="!depositDetected">
              Cancel
            </b-button>
            <div style="margin-top: 20px;" v-if="!depositDetected">
              <p v-if="checkingDeposit">Checking for deposit...</p>
              <p v-if="!checkingDeposit">Will check again in 3 seconds</p>
            </div>
          </b-col>
          <b-col v-if="actualDepositAmount">
            <h5 class="mt-0 mb-1">Actual Deposit Amount: {{ actualDepositAmount }} {{ selectedCurrency }}</h5>
            <p style="margin-top: 20px;">sent to the following address<br> 
              <span style="font-size: 18px; color: lightgreen;">{{ depositAddress }}</span>
            </p>
          </b-col>
        </b-row>
        <b-row v-if="depositDetected" style="margin-top: 45px;">
          <b-col sm="2">
            <img :src="getVTXLogo()" width="100">
          </b-col>
          <b-col>
            <h5 class="mt-0 mb-1">
              Deposit 
              <span v-if="!depositConfirmed">Detected!</span>
              <span v-if="depositConfirmed">Confirmed!</span>
            </h5>
            <p style="margin-top: 10px;">Transaction Details:<br> 
              <span style="font-size: 14px; color: lightgreen;">
                <a 
                  :href="depositTransactionDetails" 
                  style="color: lightgreen;" 
                  target="_blank">
                  {{ depositTransactionId }}
                </a>
              </span><br>
              <span>Number of confirmations: {{ confirmationsNumber }}</span>
            </p>
            <p style="margin-top: 20px;" v-if="!depositConfirmed">
              {{ vtxAmount }} VTX will be credited to your account once the 
              transaction gets at least {{ confirmationsThresholdMap[selectedCurrency] }} confirmation(s).</p>
            </p>
            <p style="margin-top: 20px; font-size: 20px;" v-if="depositConfirmed">
              {{ vtxAmount }} VTX has been credited to your account
            </p>
            <div style="margin-top: 20px;" v-if="!depositConfirmed">
              <p v-if="checkingDeposit">Checking for confirmations...</p>
              <p v-if="!checkingDeposit">Will check again in 3 seconds</p>
            </div>
          </b-col>
        </b-row>
      </div>
      <div v-if="selectedCurrency && !depositAddress">
        <h5>Set Amount</h5>
        <b-row style="margin-top: 20px;">
          <b-col>
            <b-form inline>
              <b-input-group 
                @click="setClickedAmount(selectedCurrency)"
                :left="selectedCurrency" 
                class="mb-2 mr-sm-2 mb-sm-0">
                <b-input 
                  type="number" 
                  :class="{'input-error': errors.has('selectedCurrency'), 'focused': selectedCurrencyAmountFocused}" 
                  name="selectedCurrency"
                  :data-vv-as="selectedCurrency + ' Amount'" 
                  :disabled="generatingAddress" 
                  @focus.native="selectedCurrencyAmountFocused = true"
                  @blur.native="selectedCurrencyAmountFocused = false"
                  v-model="selectedCurrencyAmount" 
                  v-validate="{required: true, min_value: 0.01, max_value: 1000000, regex: '^([0-9.]+)$'}" 
                  :placeholder="'Amount in ' +  selectedCurrency" />
              </b-input-group>
              <b-input-group 
                v-if="selectedCurrency !== 'BTC'" 
                left="BTC" 
                @click="setClickedAmount('BTC')" 
                class="mb-2 mr-sm-2 mb-sm-0">
                <b-input 
                  type="number" 
                  name="btcAmount"
                  data-vv-as="BTC Amount" 
                  :disabled="generatingAddress" 
                  :class="{'input-error': errors.has('btcAmount'), 'focused': btcAmountFocused}"
                  @focus.native="btcAmountFocused = true"
                  @blur.native="btcAmountFocused = false"
                  v-model="btcAmount" 
                  v-validate="{required: true, min_value: 0.01, max_value: 1000000, regex: '^([0-9.]+)$'}" 
                  placeholder="Amount in BTC" />
              </b-input-group>
              <b-input-group 
                left="VTX" 
                @click="setClickedAmount('VTX')" 
                class="mb-2 mr-sm-2 mb-sm-0">
                <b-input
                  v-validate="{required: true, min_value: 1, max_value: 1000000, regex: '^([0-9.]+)$'}" 
                  v-model="vtxAmount" 
                  name="vtxAmount"
                  data-vv-as="VTX Amount" 
                  :disabled="generatingAddress" 
                  @focus.native="vtxAmountFocused = true"
                  @blur.native="vtxAmountFocused = false"
                  :class="{'input-error': errors.has('vtxAmount'), 'focused': vtxAmountFocused}"
                  placeholder="Amount in VTX" />
              </b-input-group>
            </b-form>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <div v-show="errors.any()" class="help is-danger" style="margin-top: 15px;">
              <ul style="margin-left: 20px; margin-bottom: 0px; padding: 0;">
                <li v-for="error in  errors.all()" :key="error.id">{{ error }}</li>
              </ul>
            </div>
          </b-col>
        </b-row>
        <div style="margin-top: 15px;">
          <b-button 
            @click="backToCurrencySelection()">
            Back
          </b-button> &nbsp;
          <b-button 
            variant="info" 
            @click="generateDepositAddress()" 
            v-if="!generatingAddress" 
            :disabled="disableGenerate">
            Generate {{ selectedCurrency }} Deposit Address
          </b-button>
          <img v-if="generatingAddress" src="../assets/animated_spinner.gif" height="40">
        </div>
      </div>
      <div v-if="showCurrencySelection">
        <h5>Select Currency</h5>
        <b-card-group deck class="mb-3" 
          v-for="currencyGroup in currencies" 
          :key="currencyGroup.id"
          style="margin-top: 25px;">
          <b-card v-for="currency in currencyGroup" :key="currency.id"
            @click="selectCurrency(currency.symbol)"
            style="padding: 10px; max-width: 120px;"
            :img-src="currency.icon"
            :class="{'selected-card': selectedCurrency === currency.id}"
            img-alt="Card image"
            img-bottom>
            <p class="card-text text-center">
              {{ currency.symbol }}
            </p>
          </b-card>
        </b-card-group>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Contribute',
  data () {
    return {
      currencies: [],
      iconMap: {},
      fxMap: {},
      confirmationsThresholdMap: {},
      selectedCurrency: null,
      selectedCurrencyAmount: null,
      btcAmount: null,
      vtxAmount: null,
      clickedAmount: '',
      changedAmount: '',
      focused: false,
      selectedCurrencyAmountFocused: false,
      btcAmountFocused: false,
      vtxAmountFocused: false,
      depositAddress: null,
      actualDepositAmount: null,
      generatingAddress: false,
      checkingDeposit: false,
      depositDetected: false,
      confirmationsNumber: 0,
      depositConfirmed: false,
      depositTransactionId: null,
      depositTransactionDetails: '#',
      depositAmount: null,
      disableContribution: false,
      disableErrorCode: ''
    }
  },
  computed: {
    showCurrencySelection () {
      return this.selectedCurrency === null
    },
    amounts () {
      return [this.selectedCurrencyAmount, this.btcAmount, this.vtxAmount]
    },
    disableGenerate () {
      return this.errors.any() || !this.vtxAmount
    }
  },
  watch: {
    selectedCurrencyAmountFocused: function (value) {
      if (value) {
        this.clickedAmount = this.selectedCurrency
      }
    },
    btcAmountFocused: function (value) {
      if (value) {
        this.clickedAmount = 'BTC'
      }
    },
    vtxAmountFocused: function (value) {
      if (value) {
        this.clickedAmount = 'VTX'
      }
    },
    amounts: function (newValues, oldValues) {
      const vm = this
      let diffs = newValues.map(function (value, index) {
        return Math.abs(value - oldValues[index])
      })
      diffs.map(function (value, index) {
        if (value > 0) {
          switch (index) {
            case 0:
              vm.changedAmount = vm.selectedCurrency
              break
            case 1:
              vm.changedAmount = 'BTC'
              break
            case 2:
              vm.changedAmount = 'VTX'
              break
          }
        }
      })
      if (vm.clickedAmount === vm.changedAmount) {
        vm.recompute()
      }
    }
  },
  methods: {
    selectCurrency (currency) {
      this.selectedCurrency = currency
    },
    setClickedAmount (currency) {
      this.clickedAmount = currency
    },
    backToCurrencySelection () {
      this.selectedCurrency = null
      this.selectedCurrencyAmount = null
      this.btcAmount = null
      this.vtxAmount = null
      this.depositAddress = null
    },
    computePrice (from, to) {
      var amount
      switch (from) {
        case this.selectedCurrency:
          amount = this.selectedCurrencyAmount
          break
        case 'BTC':
          amount = this.btcAmount
          break
        case 'VTX':
          amount = this.vtxAmount
          break
      }
      let price = window.fx(amount).from(from).to(to)
      return price.toFixed(6)
    },
    recompute () {
      const vm = this
      let amounts = [this.selectedCurrency, 'BTC', 'VTX']
      amounts.forEach(function (value, index) {
        if (value !== vm.changedAmount) {
          switch (index) {
            case 0:
              vm.selectedCurrencyAmount = vm.computePrice(vm.changedAmount, value)
              break
            case 1:
              vm.btcAmount = vm.computePrice(vm.changedAmount, value)
              break
            case 2:
              vm.vtxAmount = vm.computePrice(vm.changedAmount, value)
              break
          }
        }
      })
    },
    generateDepositAddress () {
      const vm = this
      vm.generatingAddress = true
      var payload = {
        'api_token': this.$store.state.apiToken,
        'currency': vm.selectedCurrency
      }
      axios.post('/create-address/', payload).then(response => {
        if (response.data.success) {
          vm.depositAddress = response.data.address
          vm.depositWatchTaskId = response.data.task_id
          vm.generatingAddress = false
        }
      })
    },
    cancelDeposit () {
      const vm = this
      let payload = {
        'api_token': vm.$store.state.apiToken,
        'task_id': vm.depositWatchTaskId
      }
      axios.post('/cancel-deposit/', payload).then(response => {
        if (response.data.success) {
          this.backToCurrencySelection()
        }
      })
    },
    getVTXLogo () {
      return require('../assets/logo_white.png')
    }
  },
  created () {
    const vm = this
    axios.post('/get-currencies/', {api_token: vm.$store.state.apiToken}).then(response => {
      if (response.data.success) {
        var currencies = JSON.parse(response.data.fx_rates)
        var rates = {}
        currencies.forEach(function (currency) {
          rates[currency.symbol] = currency.price
          vm.fxMap[currency.symbol] = currency.fx_id
          vm.iconMap[currency.symbol] = currency.icon
          vm.confirmationsThresholdMap[currency.symbol] = currency.confirmations_threshold
        })
        // Hardcoded BTC_VTX rate
        rates['VTX'] = response.data.btc_vtx
        window.fx.rates = rates
        window.fx.base = 'BTC'
        while (currencies.length > 0) {
          vm.currencies.push(currencies.splice(0, 6))
        }
      } else {
        vm.disableContribution = true
        vm.disableErrorCode = response.data.error_code
      }
    })
    // Setup a ws listener
    this.$options.sockets.onmessage = function (rawMessage) {
      var message = JSON.parse(rawMessage.data)
      if (message.type === 'depositWatchResult') {
        if (vm.depositAddress === message.address) {
          vm.checkingDeposit = false
          vm.depositDetected = true
          vm.actualDepositAmount = message.amount
          vm.selectedCurrencyAmount = message.amount
          vm.depositTransactionId = message.transaction_id
          vm.depositTransactionDetails = message.transaction_link
          vm.depositAmount = message.amount
          vm.confirmationsNumber = message.confirmations
          if (vm.selectedCurrencyAmount !== vm.actualDepositAmount) {
            vm.computePrice(vm.selectedCurrency, 'VTX')
          }
          if (message.confirmed) {
            vm.depositConfirmed = true
          }
        }
      }
      if (message.type === 'depositWatchStart') {
        vm.checkingDeposit = true
      }
      if (message.type === 'depositWatchEnd') {
        vm.checkingDeposit = false
      }
    }
  }
}
</script>

<style scoped>
#contribute h3, h5, p, span {
  color: white;
}
div.card-body {
  padding: 5px 0px;
}
div.card {
  background: #2e3847;
  border: 1px solid #1e2530;
}
div.card:hover {
  border: 3px solid white;
}
.selected-card {
  border: 3px solid white !important;
}
div.card p {
  color: white;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s
}
.fade-enter, .fade-leave-to {
  opacity: 0
}
.input-error {
  border-bottom: 4px solid rgb(245, 68, 68) !important;
}
.focused {
  background: rgb(200, 240, 200) !important;
}
#deposit-watch-logs {
  color: white;
  margin-top: 20px;
}
</style>