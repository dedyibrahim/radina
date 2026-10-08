<script setup>
defineProps({ type: { type: String, required: true } })
</script>

<template>
  <svg class="original-mascot" :class="`mascot-${type}`" viewBox="0 0 180 180">
    <g v-if="type === 'original-robot'" class="mascot-bounce">
      <path
        d="M90 35V17M45 100 25 85M135 100l20-15M60 138v20M120 138v20"
        stroke="#365763"
        stroke-width="9"
        stroke-linecap="round"
      />
      <circle cx="90" cy="14" r="7" fill="#f7b85e" />
      <rect
        x="41"
        y="35"
        width="98"
        height="81"
        rx="22"
        fill="#abd7cf"
        stroke="#365763"
        stroke-width="6"
      />
      <rect
        x="59"
        y="114"
        width="62"
        height="30"
        rx="8"
        fill="#f7b85e"
        stroke="#365763"
        stroke-width="6"
      />
      <circle cx="69" cy="72" r="8" fill="#365763" />
      <circle cx="111" cy="72" r="8" fill="#365763" />
      <path
        d="M75 92q15 12 30 0"
        stroke="#365763"
        stroke-width="5"
        fill="none"
        stroke-linecap="round"
      />
    </g>
    <g v-else-if="type === 'original-racer'" class="mascot-bounce">
      <path
        d="M28 111 54 82H117l30 30v27H28Z"
        fill="#e58d5d"
        stroke="#294a5d"
        stroke-width="6"
      />
      <path
        d="M62 87V56q25-28 47 0v31"
        fill="#f1cb79"
        stroke="#294a5d"
        stroke-width="6"
      />
      <path d="M66 58H105V75H66Z" fill="#9ad8dc" />
      <circle cx="50" cy="139" r="14" fill="#294a5d" />
      <circle cx="126" cy="139" r="14" fill="#294a5d" />
    </g>
    <g v-else-if="type === 'original-village-friend'" class="mascot-bounce">
      <path
        d="M43 68Q90 10 137 68Z"
        fill="#ecd082"
        stroke="#6c6748"
        stroke-width="5"
      />
      <circle
        cx="90"
        cy="85"
        r="31"
        fill="#e4b48e"
        stroke="#6c6748"
        stroke-width="5"
      />
      <path
        d="M57 131q33-24 66 0v29H57Z"
        fill="#82b6a0"
        stroke="#6c6748"
        stroke-width="5"
      />
      <circle cx="78" cy="81" r="4" fill="#484942" />
      <circle cx="102" cy="81" r="4" fill="#484942" />
      <path d="M82 97q8 7 16 0" stroke="#484942" stroke-width="4" fill="none" />
    </g>
    <g
      v-else-if="type === 'original-fish' || type === 'original-sea-friends'"
      class="mascot-float"
    >
      <path
        d="M38 90 8 64v52z"
        fill="#f2a064"
        stroke="#754c50"
        stroke-width="5"
        stroke-linejoin="round"
      />
      <ellipse
        cx="88"
        cy="90"
        rx="55"
        ry="38"
        fill="#69c9c4"
        stroke="#356a70"
        stroke-width="5"
      />
      <path
        d="M78 56q-25 34 0 68"
        fill="none"
        stroke="#e7f4d5"
        stroke-width="8"
        opacity=".8"
      />
      <circle cx="112" cy="82" r="6" fill="#173c4b" />
      <path
        d="M108 103q12 10 23 0"
        fill="none"
        stroke="#173c4b"
        stroke-width="4"
        stroke-linecap="round"
      />
    </g>
    <g v-else-if="type === 'original-dinosaur'" class="mascot-bounce">
      <path
        d="M30 130q-4-38 28-50l9-37 18 24q44-12 59 22l20 12-18 15-6 35h-19l-4-25H75l-8 25H49l2-26z"
        fill="#83b96b"
        stroke="#395d48"
        stroke-width="6"
        stroke-linejoin="round"
      />
      <path
        d="m64 80 16-24 16 20 17-13 18 27"
        fill="#f4c65d"
        stroke="#395d48"
        stroke-width="5"
        stroke-linejoin="round"
      />
      <circle cx="117" cy="86" r="5" fill="#263f3b" />
      <path
        d="M113 104q10 7 20 0"
        fill="none"
        stroke="#263f3b"
        stroke-width="4"
        stroke-linecap="round"
      />
    </g>
    <g v-else-if="type === 'original-astronaut'" class="mascot-float">
      <path
        d="m46 66-18-22 9-17 27 17M130 66l20-22-10-17-27 17"
        fill="#d9a7e8"
        stroke="#514478"
        stroke-width="5"
      />
      <circle
        cx="90"
        cy="68"
        r="45"
        fill="#f2eddf"
        stroke="#655c89"
        stroke-width="7"
      />
      <ellipse
        cx="90"
        cy="68"
        rx="27"
        ry="24"
        fill="#8ec9d5"
        stroke="#514478"
        stroke-width="5"
      />
      <path
        d="M62 118q28-20 56 0l13 43H49z"
        fill="#e6d8f0"
        stroke="#655c89"
        stroke-width="6"
      />
      <circle cx="82" cy="67" r="4" fill="#233b52" />
      <circle cx="99" cy="67" r="4" fill="#233b52" />
    </g>
    <g
      v-else-if="
        type === 'original-jungle-friend' || type === 'original-farm-friend'
      "
      class="mascot-bounce"
    >
      <path
        d="M42 82 24 49l34 9M138 82l18-33-34 9"
        fill="#d59b68"
        stroke="#664f42"
        stroke-width="6"
        stroke-linejoin="round"
      />
      <ellipse
        cx="90"
        cy="94"
        rx="53"
        ry="48"
        fill="#dcae79"
        stroke="#664f42"
        stroke-width="6"
      />
      <ellipse cx="90" cy="112" rx="28" ry="20" fill="#f2dfc5" />
      <circle cx="73" cy="87" r="5" fill="#3d3433" />
      <circle cx="107" cy="87" r="5" fill="#3d3433" />
      <path
        d="M82 110q8 7 16 0"
        fill="none"
        stroke="#664f42"
        stroke-width="4"
        stroke-linecap="round"
      />
    </g>
    <g v-else-if="type === 'original-owl'" class="mascot-float">
      <path
        d="m42 62-8-38 36 19M138 62l8-38-36 19"
        fill="#a994cf"
        stroke="#554a7b"
        stroke-width="6"
        stroke-linejoin="round"
      />
      <ellipse
        cx="90"
        cy="96"
        rx="54"
        ry="60"
        fill="#c9b8e2"
        stroke="#554a7b"
        stroke-width="6"
      />
      <ellipse cx="68" cy="88" rx="19" ry="22" fill="#fff5d8" />
      <ellipse cx="112" cy="88" rx="19" ry="22" fill="#fff5d8" />
      <circle cx="72" cy="89" r="6" fill="#35405c" />
      <circle cx="108" cy="89" r="6" fill="#35405c" />
      <path d="m90 101-10 13h20z" fill="#eaa867" />
    </g>
    <g v-else-if="type === 'original-candy-friend'" class="mascot-bounce">
      <path
        d="m44 67-26-19 4 42zM136 67l26-19-4 42z"
        fill="#f49bb0"
        stroke="#85557c"
        stroke-width="5"
        stroke-linejoin="round"
      />
      <path
        d="M90 35c47 0 61 37 48 77-10 31-33 43-48 43s-38-12-48-43C29 72 43 35 90 35Z"
        fill="#f7c1d0"
        stroke="#85557c"
        stroke-width="6"
      />
      <circle cx="73" cy="91" r="5" fill="#4e3f5c" />
      <circle cx="107" cy="91" r="5" fill="#4e3f5c" />
      <path
        d="M78 112q12 14 24 0"
        fill="none"
        stroke="#85557c"
        stroke-width="5"
        stroke-linecap="round"
      />
      <path
        d="M58 51q-20-25 4-30M122 51q20-25-4-30"
        fill="none"
        stroke="#e8a949"
        stroke-width="8"
        stroke-linecap="round"
      />
    </g>
    <g v-else-if="type === 'original-garden-sprite'" class="mascot-float">
      <path
        d="M48 90Q8 48 20 26q36 7 55 45M132 90q40-42 28-64-36 7-55 45"
        fill="#d9e9b5"
        stroke="#6b8c73"
        stroke-width="5"
      />
      <circle
        cx="90"
        cy="94"
        r="38"
        fill="#efd8a9"
        stroke="#827254"
        stroke-width="5"
      />
      <circle cx="77" cy="91" r="4" fill="#364848" />
      <circle cx="103" cy="91" r="4" fill="#364848" />
      <path
        d="M82 108q8 8 16 0"
        fill="none"
        stroke="#705b62"
        stroke-width="4"
        stroke-linecap="round"
      />
      <path
        d="M90 48v-18M83 36l7-10 7 10"
        fill="none"
        stroke="#8eaa6a"
        stroke-width="5"
      />
    </g>
    <g v-else-if="type === 'original-young-hero'" class="mascot-bounce">
      <path
        d="M52 66 25 44l12 72q12 23 36 20M128 66l27-22-12 72q-12 23-36 20"
        fill="#ed705e"
        stroke="#394c73"
        stroke-width="6"
        stroke-linejoin="round"
      />
      <circle
        cx="90"
        cy="65"
        r="35"
        fill="#edc59a"
        stroke="#394c73"
        stroke-width="6"
      />
      <path
        d="M55 61q8-46 68-25l7 20q-38-18-75 5"
        fill="#f3d65c"
        stroke="#394c73"
        stroke-width="5"
      />
      <path
        d="M58 111q32-21 64 0l18 51H40z"
        fill="#5599cf"
        stroke="#394c73"
        stroke-width="6"
      />
      <circle cx="78" cy="70" r="4" fill="#273954" />
      <circle cx="102" cy="70" r="4" fill="#273954" />
    </g>
  </svg>
</template>
