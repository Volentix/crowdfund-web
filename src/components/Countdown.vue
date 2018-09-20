<template>
  <div id="countdown">
    <span v-if="secondsPassed > 0">
      <span v-if="showdays == '1'">{{ days | two_digits }}D </span>
      {{ hours | two_digits }}H {{ minutes | two_digits }}M {{ seconds | two_digits }}S
    </span>
    <span v-if="secondsPassed == 0">{{ initial }}</span>
  </div>
</template>

<script>
export default {
  props: ['initial', 'totalseconds', 'showdays'],
  data () {
    return {
      initial: '',
      totalSeconds: 0,
      secondsPassed: 0,
      initialDays: 0,
      initialHours: 0,
      initialMinutes: 0,
      initialSeconds: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    }
  },
  methods: {
    recompute () {
      var remainingSeconds = this.totalSeconds - this.secondsPassed
      if (remainingSeconds >= 86400) {
        let daysFloat = remainingSeconds / 86400
        this.days = parseInt(daysFloat)
        remainingSeconds -= parseInt(daysFloat) * 86400
      } else {
        this.days = this.initialDays
      }
      if (remainingSeconds >= 3600) {
        let hoursFloat = remainingSeconds / 3600
        this.hours = parseInt(hoursFloat)
        remainingSeconds -= parseInt(hoursFloat) * 3600
      } else {
        this.hours = this.initialHours
      }
      if (remainingSeconds >= 60) {
        let minutesFloat = remainingSeconds / 60
        this.minutes = parseInt(minutesFloat)
        remainingSeconds -= parseInt(minutesFloat) * 60
      } else {
        this.minutes = this.initialMinutes
      }
      this.seconds = remainingSeconds
    }
  },
  watch: {
    initial: function (newVal) {
      try {
        this.initialDays = parseInt(newVal.split(' ')[0]).replace('D', '')
        this.initialHours = parseInt(newVal.split(' ')[1]).replace('H', '')
        this.initialMinutes = parseInt(newVal.split(' ')[2]).replace('M', '')
        this.initialSeconds = parseInt(newVal.split(' ')[3]).replace('S', '')
      } catch (err) {}
    },
    totalseconds: function (newVal) {
      this.totalSeconds = newVal
    }
  },
  mounted () {
    let vm = this
    vm.recompute()
    setInterval(function () {
      vm.secondsPassed += 1
      vm.recompute()
    }, 1000)
  }
}
</script>
